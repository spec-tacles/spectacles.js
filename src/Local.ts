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
  public publish(event: string, data: any): void {
    if (this.events.has(event)) {
      if (Buffer.isBuffer(data)) data = JSON.parse(data.toString());
      this.emit(event, data, () => {});
    }
  }

  /**
   * Placeholder connect method: isn't actually needed for a local broker.
   * @returns {undefined}
   */
  public connect(): void {}
}
