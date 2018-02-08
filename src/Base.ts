import { EventEmitter } from 'events';

/**
 * A message broker. Used to transmit data to and from the Discord Gateway.
 * @abstract
 */
export default abstract class Broker extends EventEmitter {

  /**
   * The events that this broker handles.
   * @type {Set<string>}
   */
  public readonly events: Set<string> = new Set();

  /**
   * Subscribe this broker to some events.
   * @param {string|Iterable<string>} events The events to subscribe to
   * @param {...*} args Any other args the subscription might require
   * @returns {*}
   */
  public subscribe(events: string | Iterable<string>, ...args: any[]): any {
    if (typeof events === 'string') events = [events];
    for (const e of events) this.events.add(e);
  }

  /**
   * Unsubscribe this broker from some events.
   * @param {string|Iterable<string>} events The events to unsubscribe from
   * @param {...*} args Any other args the unsubscription might take
   * @returns {*}
   */
  public unsubscribe(events: string | Iterable<string>, ...args: any[]): any {
    if (typeof events === 'string') events = [events];
    for (const e of events) this.events.delete(e);
  }

  /**
   * Connect this broker to wherever it sends and receives messages.
   * @param {string} url The URL to connect to
   * @param {...*} args Any args the connection might take
   * @returns {*}
   * @abstract
   */
  public abstract connect(url: string, ...args: any[]): any;

  /**
   * Publish an event to this broker. Will be emitted on subscribed brokers.
   * @param {string} event The event to publish
   * @param {*} data The data of the event
   * @param {...*} args Any other args the publishing might take
   */
  public abstract publish(event: string, data: any, ...args: any[]): any;
}
