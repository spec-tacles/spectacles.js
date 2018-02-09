import { encode, decode } from '@spectacles/util';
import * as amqp from 'amqplib';
import { randomBytes } from 'crypto';
import Broker from './Base';
import { EventEmitter } from 'events';

/**
 * A broker for AMQP clients. Probably most useful for RabbitMQ.
 * @extends Broker
 */
export default class Amqp extends Broker {
  /**
   * The AMQP channel currently connected to.
   * @type {?amqp.Channel}
   */
  public channel?: amqp.Channel;

  /**
   * The callback queue.
   * @type {?string}
   */
  public callback?: string;

  /**
   * The AMQP exchange of this broker.
   * @type {string}
   */
  public group: string;

  /**
   * The consumers that this broker has registered.
   * @type {{[event: string]: string}}
   * @private
   */
  private _consumers: { [event: string]: string } = {};

  private _responses: EventEmitter = new EventEmitter();

  /**
   * @constructor
   * @param {Client} client The client of this broker
   * @param {string} [group='default'] The group of this broker
   */
  constructor(group: string = 'default') {
    super();
    this.group = group;
  }

  /**
   * Connect this broker to your AMQP client.
   * @param {string} url The URL of your AMQP client
   * @param {?*} options Options to connect to the AMQP client
   * @returns {Promise<void>}
   */
  public async connect(url: string, options?: any): Promise<void> {
    const connection = await amqp.connect(`amqp://${url}`, options);
    this.channel = await connection.createChannel();

    // setup RPC callback queue
    this.callback = (await this.channel.assertQueue('', { exclusive: true })).queue;
    this.channel.consume(this.callback, (msg) => {
      if (msg) this._responses.emit(msg.properties.correlationId, decode(msg.content));
    });

    await this.channel.assertExchange(this.group, 'direct');
  }

  /**
   * Subscribe this broker to some AMQP queues.
   * @param {string|Iterable<string>} events The events to subscribe to
   * @param {{consume: ?amqp.Options.Consume, assert: ?amqp.Options.AssertQueue}} options The connection options
   * @returns {Promise<amqp.Replies.Consume[]>}
   */
  public subscribe(events: string | Iterable<string>, options: {
    consume?: amqp.Options.Consume,
    assert?: amqp.Options.AssertQueue,
  } = {}): Promise<amqp.Replies.Consume[]> {
    super.subscribe(events);

    if (typeof events === 'string') events = [events];
    if (!Array.isArray(events)) events = Array.from(events);

    // register consumers in parallel
    return Promise.all((events as Array<string>).map(async event => {
      // setup queue
      const queue = `${this.group}:${event}`;
      await this._channel.assertQueue(queue, options.assert);
      await this._channel.bindQueue(queue, this.group, event);

      // register consumer
      const consumer = await this._channel.consume(queue, msg => {
        // emit consumed messages with an acknowledger function
        if (msg) {
          this.emit(event, decode(msg.content), (response: any = null) => {
            this._channel.sendToQueue(msg.properties.replyTo, encode(response), { correlationId: msg.properties.correlationId });
            this._channel.ack(msg);
          });
        }
      }, options.consume);

      this._consumers[event] = consumer.consumerTag;
      return consumer;
    }));
  }

  /**
   * Unsubscribe this broker from some AMQP queues.
   * @param {string | string[]} events The channels to unsubscribe from
   * @returns {Promise<undefined[]>}
   */
  public unsubscribe(events: string | string[]): Promise<void[]> {
    super.unsubscribe(events);

    if (typeof events === 'string') events = [events];
    return Promise.all(events.map(chan => {
      if (this._consumers[chan]) {
        const cancel = this._channel.cancel(this._consumers[chan]);
        delete this._consumers[chan];
        return cancel;
      }

      return Promise.resolve();
    }) as Promise<void>[]);
  }

  /**
   * Publish an event to the AMQP broker.
   * @param {string} event The event to publish
   * @param {*} data The data to publish
   * @param {?amqp.Options.Publish} options AMQP publish options
   */
  public async publish(event: string, data: any, options?: amqp.Options.Publish) {
    const correlation = randomBytes(20).toString('hex');
    await this._channel.publish(this.group, event, encode(data), {
      replyTo: this.callback,
      correlationId: correlation,
    });

    return new Promise(r => this._responses.once(correlation, r));
  }

  /**
   * Convenience accessor for the AMQP channel.
   * @throws {Error} When the channel doesn't exist
   * @returns {amqp.Channel} The AMQP channel.
   * @protected
   */
  protected get _channel(): amqp.Channel {
    if (!this.channel) throw new Error('no available amqp channel');
    return this.channel;
  }
}
