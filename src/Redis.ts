import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { zipObject, partition, isObject } from 'lodash';
import { resolve } from 'path';
import { encode, decode } from '@spectacles/util';
import Redis = require('ioredis');
import Broker from './Base';
import { EventEmitter } from 'events';

declare module 'ioredis' {
  interface Redis {
    xcleangroup(key: string, group: string): Promise<boolean>;
    xadd(key: Redis.KeyType, id: string, ...args: any[]): Promise<any>;
  }
}

type ReadGroupResponse = [string, [string, string[]][]][];

export interface PublishOptions {
  timeout?: number;
}

export interface ClientOptions {
  blockInterval?: number;
  maxChunk?: number;
  name?: string;
}

Redis.Command.setArgumentTransformer('xadd', (args) => {
  if (args.length === 3) {
    const toAdd = args.pop();
    if (!isObject(toAdd)) throw new Error('unable to add publish non-object');

    let entries: Iterable<[any, any]>;
    if (toAdd instanceof Map) entries = toAdd.entries();
    else entries = Object.entries(toAdd);

    const arr = [];
    for (const [k, v] of entries) arr.push(k, v);
    return args.concat(arr);
  }

  return args;
});

export default class RedisBroker<Send = any, Receive = any> extends Broker<Send, Receive> {
  public name: string;
  public blockInterval: number;
  public maxChunk: number;

  protected _listening: boolean = false;
  protected _streamReadClient: Redis.Redis;
  protected _rpcReadClient: Redis.Redis;

  constructor(public group: string, public redis: Redis.Redis, options: ClientOptions = {}) {
    super();

    this.name = options.name || randomBytes(20).toString('hex');
    this.blockInterval = options.blockInterval || 5000;
    this.maxChunk = options.maxChunk || 10;

    redis.defineCommand('xcleangroup', {
      numberOfKeys: 1,
      lua: readFileSync(resolve(__dirname, '..', '..', 'scripts', 'xcleangroup.lua')).toString(),
    });

    this._rpcReadClient = redis.duplicate();
    this._rpcReadClient.on('messageBuffer', (channel: Buffer, message: Buffer) => {
      const [, id] = channel.toString().split(':');
      if (id) this._handleMessage(id, message);
    });

    this._streamReadClient = redis.duplicate();
  }

  public publish(event: string, data: Send): Promise<string> {
    return this.redis.xadd(event, '*', data);
  }

  public async call(method: string, data: Send, options: PublishOptions = {}): Promise<Receive> {
    const id = await this.publish(method, data);
    const rpcChannel = `${method}:${id}`;
    await this._rpcReadClient.subscribe(rpcChannel);

    try {
      return await this._awaitResponse(id, options.timeout);
    } finally {
      this._rpcReadClient.unsubscribe(rpcChannel);
    }
  }

  protected async _subscribe(events: string[]): Promise<void> {
    await Promise.all(events.map(async event => {
      try {
        await this.redis.xgroup('CREATE', event, this.group, 0, 'MKSTREAM');
      } catch (e) {
        if (!(e instanceof (Redis as any).ReplyError)) throw e;
      }
    }));

    this._listen();
  }

  protected async _unsubscribe(events: string[]): Promise<void> {
    const cmds: string[][] = Array(events.length * 2);
    for (let i = 0; i < cmds.length; i += 2) {
      const event = events[i / 2];
      cmds[i] = ['xgroup', 'delconsumer', event, this.group, this.name];
      cmds[i+1] = ['xcleangroup', event, this.group];
    }

    await this.redis.pipeline(cmds).exec();
  }

  private async _listen(): Promise<void> {
    if (this._listening) return;
    this._listening = true;

    let events: Array<string>;
    while (true) {
      events = Object.keys(this.handlers);

      try {
        let data: ReadGroupResponse | null = await this._streamReadClient.xreadgroup(
          'GROUP', this.group, this.name,
          'COUNT', String(this.maxChunk),
          'BLOCK', String(this.blockInterval),
          'STREAMS', ...events,
          ...Array(events.length).fill('>'),
        );

        /*
        data = {
          event: {
            id: packet,
          },
        }
        */
        if (!data) continue;

        for (const [event, info] of data) {
          for (const [id, packet] of info) {
            let i = 0;
            const obj = zipObject(...partition(packet, () => i++ % 2 === 0)) as unknown as Receive;

            this.redis.xack(event, this.group, id);
            try {
              const res = await this._handleMessage(event, obj);
              await this.redis.publish(`${event}:${id}`, encode(res) as any);
            } catch (e) {
              this.emit('error', e);
            }
          }
        }
      } catch (e) {
        this.emit('error', e);
        break;
      }
    }

    this._listening = false;
  }
}
