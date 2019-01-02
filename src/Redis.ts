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
  rpc?: boolean;
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

export default class RedisBroker extends Broker {
  public name: string;
  public blockInterval: number;
  public maxChunk: number;
  public ignore: Set<string | symbol> = new Set([
    'newListener',
    'removeListener',
    'subscribe',
    'unsubscribe',
  ]);

  protected _listening: boolean = false;
  protected _streamReadClient: Redis.Redis;
  protected _rpcReadClient?: Redis.Redis;
  protected _responses: EventEmitter = new EventEmitter();

  constructor(public group: string, public redis: Redis.Redis, options: ClientOptions = {}) {
    super();

    this.name = options.name || randomBytes(20).toString('hex');
    this.blockInterval = options.blockInterval || 5000;
    this.maxChunk = options.maxChunk || 10;
    this.rpc = options.rpc || false;

    redis.defineCommand('xcleangroup', {
      numberOfKeys: 1,
      lua: readFileSync(resolve(__dirname, '..', 'scripts', 'xcleangroup.lua')).toString(),
    });

    if (this.rpc) {
      this._rpcReadClient = redis.duplicate();
      this._rpcReadClient.on('messageBuffer', (channel: Buffer, message: Buffer) => {
        const [, id] = channel.toString().split(':');

        if (id) {
          const data = decode(message);
          this._responses.emit(id, data);
        }
      });
    }

    this._streamReadClient = redis.duplicate();
  }

  public async publish(event: string, data: object, options: PublishOptions = {}): Promise<any> {
    const id: string = await this.redis.xadd(event, '*', data);

    if (this.rpc && this._rpcReadClient) {
      const rpcChannel = `${event}:${id}`;
      await this._rpcReadClient.subscribe(rpcChannel);

      try {
        return await new Promise((resolve, reject) => {
          this._responses.once(id, resolve);
          if (options.timeout) {
            setTimeout(() => {
              this._responses.removeListener(id, resolve);
              reject(new Error('Redis RPC callback timed out'));
            }, options.timeout);
          }
        });
      } finally {
        this._rpcReadClient.unsubscribe(rpcChannel);
      }
    }

    return id;
  }

  public async subscribe(events: string | string[]): Promise<void> {
    if (!Array.isArray(events)) events = [events];

    await Promise.all(events.map(async event => {
      try {
        await this.redis.xgroup('CREATE', event, this.group, 0, 'MKSTREAM');
      } catch (e) {
        if (!(e instanceof (Redis as any).ReplyError)) throw e;
      }
    }));

    this._listen();
  }

  public async unsubscribe(event: string): Promise<void> {
    await this.redis.xgroup('DELCONSUMER', event, this.group, this.name);
    await this.redis.xcleangroup(event, this.group);
  }

  private async _listen(): Promise<void> {
    if (this._listening) return;
    this._listening = true;

    let events: Array<string | symbol>;
    while (true) {
      events = this.eventNames().filter(e => !this.ignore.has(e));
      if (events.every(name => this.listenerCount(name) === 0)) break;

      try {
        let data: ReadGroupResponse | null = await this._streamReadClient.xreadgroup(
          'GROUP', this.group, this.name,
          'COUNT', String(this.maxChunk),
          'BLOCK', String(this.blockInterval),
          'STREAMS', ...events.map(String),
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
            const obj = zipObject(...partition(packet, () => i++ % 2 === 0));

            this.emit(event, obj, {
              ack: () => this.redis.xack(event, this.group, id),
              reply: (data: any) => this.redis.publish(`${event}:${id}`, encode(data) as any),
            });
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
