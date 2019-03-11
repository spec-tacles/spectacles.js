import Broker from './Base';
import { decode } from '@spectacles/util';

/**
 * A local message broker; emits events on itself.
 * @extends Broker
 */
export default class Local<T> extends Broker<T, T> {
  /**
   * Publish an event to this broker.
   * @param {string} event The event to publish
   * @param {*} data The data to publish
   * @returns {undefined}
   */
  public async publish(event: string, data: T): Promise<T> {
    await this._handleMessage(event, data);
    return data;
  }

  public call(method: string, data: T): Promise<T> {
    const res = this.publish(method, data);
    if (res) return res;
    return Promise.reject(new Error(`no handler for method ${method}`));
  }

  protected _subscribe(): void {
    // do nothing
  }

  protected _unsubscribe(): void {
    // do nothing
  }
}
