import Broker from './Base';

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
      if (Buffer.isBuffer(data)) data = JSON.parse(data.toString());
      this.emit(event, data, { ack: () => {} });
    }

    return Promise.resolve();
  }

  protected subscribe(): Promise<void> {
    return Promise.resolve();
  }

  protected unsubscribe(): Promise<void> {
    return Promise.resolve();
  }
}
