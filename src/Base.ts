import { EventEmitter } from 'events';

/**
 * A message broker. Used to transmit data to and from the Discord Gateway.
 * @abstract
 */
export default abstract class Broker extends EventEmitter {
  constructor() {
    super();

    this.on('newListener', (event) => {
      this.subscribe(event).then(result => this.emit('subscribe', result), e => this.emit('error', e));
    });

    this.on('removeListener', (event) => {
      this.unsubscribe(event).then(result => this.emit('unsubscribe', result), e => this.emit('error', e));
    });
  }

  /**
   * Subscribe this broker to some events.
   * @param {string|Iterable<string>} events The events to subscribe to
   * @param {...*} args Any other args the subscription might require
   * @returns {*}
   */
  protected abstract subscribe(event: string): Promise<any>;

  /**
   * Unsubscribe this broker from some events.
   * @param {string|Iterable<string>} events The events to unsubscribe from
   * @param {...*} args Any other args the unsubscription might take
   * @returns {*}
   */
  protected abstract unsubscribe(event: string): Promise<any>;

  /**
   * Publish an event to this broker. Will be emitted on subscribed brokers.
   * @param {string} event The event to publish
   * @param {*} data The data of the event
   * @param {...*} args Any other args the publishing might take
   */
  public abstract publish(event: string, data: any, ...args: any[]): Promise<any>;
}
