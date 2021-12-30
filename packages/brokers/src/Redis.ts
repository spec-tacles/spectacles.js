import { randomBytes } from 'crypto';
import { readFileSync } from 'fs';
import { resolve } from 'path';
import Redis from 'ioredis';
import Broker, { ResponseOptions } from './Base';

declare module 'ioredis' {
  interface Redis {
    xcleangroup(key: string, group: string): Promise<boolean>;
    xreadgroupBuffer(...args: Array<string | Buffer>): Promise<[Buffer, [Buffer, Buffer[]][]][]>;
  }
}

export interface PublishOptions {
  timeout?: number;
}

export interface ClientOptions {
  blockInterval?: number;
  maxChunk?: number;
  name?: string;
}

export interface RedisResponseOptions extends ResponseOptions {
  ack: () => Promise<void>;
}

const STREAM_DATA_KEY = 'data';

export default class RedisBroker extends Broker<RedisResponseOptions> {
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
      lua: readFileSync(resolve(__dirname, '..', 'scripts', 'xcleangroup.lua'), 'utf8'),
    });

    this._rpcReadClient = redis.duplicate();
    this._rpcReadClient.on('messageBuffer', (channel: Buffer, message: Buffer) => {
      const [, id] = channel.toString().split(':');
      if (id) this._handleReply(id, message);
    });

    this._streamReadClient = redis.duplicate();
  }

  public publish(event: string, data: any): Promise<string> {
    return this.redis.xadd(event, '*', STREAM_DATA_KEY, this.serialize(data));
  }

  public async call(method: string, data: any, options: PublishOptions = {}): Promise<unknown> {
    const id = await this.publish(method, data);
    const rpcChannel = `${method}:${id}`;
    await this._rpcReadClient.subscribe(rpcChannel);

    try {
      return await this._awaitResponse(id, options.timeout);
    } finally {
      this._rpcReadClient.unsubscribe(rpcChannel);
    }
  }

  public disconnect() {
    this.redis.disconnect(false);
    this._streamReadClient.disconnect(false);
    this._rpcReadClient.disconnect(false);
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

    while (true) {
      try {
        let data = await this._streamReadClient.xreadgroupBuffer(
          'GROUP', this.group, this.name,
          'COUNT', String(this.maxChunk),
          'BLOCK', String(this.blockInterval),
          'STREAMS', ...this._subscribedEvents,
          ...Array(this._subscribedEvents.size).fill('>'),
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
            const i = packet.findIndex((v, i) => v.toString('utf8') === STREAM_DATA_KEY && i % 2 === 0);
            if (i < 0) continue;

            const data = packet[i + 1];
            if (!data) continue;

            this._handleMessage(event.toString('utf8'), data, {
              reply: async (data) => { await this.redis.publishBuffer(`${event}:${id}`, this.serialize(data)) },
              ack: async () => { await this.redis.xack(event, this.group, id) },
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
