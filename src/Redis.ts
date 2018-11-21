import { Redis } from 'ioredis';
import Broker from './Base';

export default class RedisBroker extends Broker {
  constructor(public redis: Redis) {
    super();
  }

  public publish(event: string, data: unknown): Promise<void> {
    this.redis.xadd(event, '*', data);
  }
}
