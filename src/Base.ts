import { EventEmitter } from 'events';
import { decode, encode } from '@spectacles/util';

export interface SendOptions {
  expiration?: number;
}

export interface ResponseOptions {
  reply: (data: any) => void;
}

export type EventHandler<T> = (data: T, options: ResponseOptions) => void;

/**
 * A message broker. Used to transmit data to and from the Discord Gateway.
 * @abstract
 */
export default abstract class Broker<Send, Receive, ROpts extends ResponseOptions = ResponseOptions> extends EventEmitter {
  public static DEFAULT_EXPIRATION = 5e3;

  protected readonly _subscribedEvents = new Set<string>();
  private readonly _responses: EventEmitter;

  constructor() {
    super();
    this._responses = new EventEmitter();
    this._responses.setMaxListeners(0);
  }

  /**
   * Publish an event to this broker. Will be emitted on subscribed brokers.
   * @param {string} event The event to publish
   * @param {*} data The data of the event
   * @param {...*} args Any other args the publishing might take
   */
  public abstract publish(event: string, data: Send, options?: SendOptions): any;

  /**
   * Make an RPC call on this broker if RPC is enabled.
   * @param method The RPC method to call
   * @param data The data to call the method with
   */
  public abstract call(method: string, data: Send, ...args: any[]): any;

  /**
   * Subscribe this broker to some events.
   * @param {string|Iterable<string>} events The events to subscribe to
   * @param {...*} args Any other args the subscription might require
   * @returns {*}
   */
  public subscribe(events: string | string[]): any {
    if (!Array.isArray(events)) events = [events];
    for (const event of events) this._subscribedEvents.add(event);
    return this._subscribe(events);
  }

  /**
   * Unsubscribe this broker from some events.
   * @param {string|Iterable<string>} events The events to unsubscribe from
   * @param {...*} args Any other args the unsubscription might take
   * @returns {*}
   */
  public unsubscribe(events: string | string[]): any {
    if (!Array.isArray(events)) events = [events];
    for (const event of events) this._subscribedEvents.delete(event);
    return this._unsubscribe(events);
  }

  protected abstract _subscribe(events: string[]): any;
  protected abstract _unsubscribe(events: string[]): any;

  protected _handleMessage(event: string, message: Buffer | Receive, options: ROpts): void {
    if (Buffer.isBuffer(message)) message = decode<Receive>(message);
    this.emit(event, message, options);
  }

  protected _handleReply(event: string, message: Buffer | Receive): void {
    if (Buffer.isBuffer(message)) message = decode<Receive>(message);
    this._responses.emit(event, message);
  }

  protected _awaitResponse(id: string, expiration: number = Broker.DEFAULT_EXPIRATION) {
    return new Promise<Receive>((resolve, reject) => {
      let timeout: NodeJS.Timer;

      const listener = (response: Receive) => {
        clearTimeout(timeout);
        resolve(response);
      };

      timeout = setTimeout(() => {
        this._responses.removeListener(id, listener);
        reject(new Error('callback exceeded time limit'));
      }, expiration);

      this._responses.once(id, listener);
    });
  }
}
