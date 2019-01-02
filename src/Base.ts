import { EventEmitter } from 'events';

/**
 * A message broker. Used to transmit data to and from the Discord Gateway.
 * @abstract
 */
export default abstract class Broker extends EventEmitter {
  public rpc: boolean = false;

  /**
   * Publish an event to this broker. Will be emitted on subscribed brokers.
   * @param {string} event The event to publish
   * @param {*} data The data of the event
   * @param {...*} args Any other args the publishing might take
   */
  public abstract publish(event: string, data: any): Promise<any>;

  /**
   * Subscribe this broker to some events.
   * @param {string|Iterable<string>} events The events to subscribe to
   * @param {...*} args Any other args the subscription might require
   * @returns {*}
   */
  public abstract subscribe(event: string | string[]): Promise<any>;

  /**
   * Unsubscribe this broker from some events.
   * @param {string|Iterable<string>} events The events to unsubscribe from
   * @param {...*} args Any other args the unsubscription might take
   * @returns {*}
   */
  public abstract unsubscribe(event: string | string[]): Promise<any>;
}
