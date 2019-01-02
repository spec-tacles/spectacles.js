import Broker from './Base';
import { decode } from '@spectacles/util';

/**
 * A local message broker; emits events on itself.
 * @extends Broker
 */
export default class Local extends Broker {
  /**
   * Publish an event to this broker.
   * @param {string} event The event to publish
   * @param {*} data The data to publish
   * @returns {undefined}
   */
  public publish(event: string, data: any): Promise<void> {
    if (this.eventNames().includes(event)) {
      return new Promise((resolve) => {
        if (Buffer.isBuffer(data)) data = decode(data.toString());
        this.emit(event, data, { ack: () => {}, reply: resolve });
        if (!this.rpc) resolve();
      });
    }

    return Promise.resolve();
  }

  public subscribe(): Promise<void> {
    return Promise.resolve();
  }

  public unsubscribe(): Promise<void> {
    return Promise.resolve();
  }
}
