import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { zipObject, partition, isObject } from 'lodash';
import { resolve } from 'path';
import Redis = require('ioredis');
import Broker from './Base';

declare module 'ioredis' {
  interface Redis {
    xcleangroup(key: string, group: string): Promise<boolean>;
    xadd(key: Redis.KeyType, id: string, ...args: any[]): Promise<any>;
  }
}

export type ReadGroupResponse = [string, [string, string[]][]][];

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
  public name: string = randomBytes(20).toString('hex');
  public blockInterval: number = 5000;
  public maxChunk: number = 10;

  protected _listening: boolean = false;
  protected _subClient: Redis.Redis;

  constructor(public group: string, public redis: Redis.Redis) {
    super();

    redis.defineCommand('xcleangroup', {
      numberOfKeys: 1,
      lua: readFileSync(resolve(__dirname, '..', 'scripts', 'xcleangroup.lua')).toString(),
    });

    this._subClient = redis.duplicate();
    this._listen();
  }

  public publish(event: string, data: object): Promise<string> {
    return this.redis.xadd(event, '*', data);
  }

  protected async subscribe(event: string): Promise<void> {
    try {
      await this.redis.xgroup('CREATE', event, this.group, 0, 'MKSTREAM');
    } catch (e) {
      if (!(e instanceof (Redis as any).ReplyError)) throw e;
    }

    this._listen();
  }

  protected async unsubscribe(event: string): Promise<void> {
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
        console.time('xreadgroup');
        let data: ReadGroupResponse | null = await this._subClient.xreadgroup(
          'GROUP', this.group, this.name,
          'COUNT', String(this.maxChunk),
          'BLOCK', String(this.blockInterval),
          'STREAMS', ...events.map(String),
          ...Array(events.length).fill('>'),
        );
        console.timeEnd('xreadgroup');

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
