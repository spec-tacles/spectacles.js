import Broker from './Base';
import { ChildProcess } from 'child_process';
import { ulid } from 'ulid';

export interface IpcMessage {
  event: string;
  data: any;
  key?: string;
}

export default class Ipc extends Broker {
  private _events: Set<string> = new Set();
  private _callbacks: { [key: string]: (data: unknown) => void } = {};

  constructor(public child?: ChildProcess) {
    super();
    const listener = (message: IpcMessage) => {
      if (message.key && this._callbacks[message.key]) {
        this._callbacks[message.key](message.data);
        delete this._callbacks[message.key];
      } else if (this._events.has(message.event)) {
        this.emit(message.event, message.data, {
          reply: (data: any) => message.key ? this._send({ event: message.event, data, key: message.key }) : null,
        });
      }
    };

    if (child) child.on('message', listener);
    else process.on('message', listener);
  }

  public publish(event: string, data: any): Promise<unknown> {
    return new Promise<unknown>((resolve, reject) => {
      const message: IpcMessage = { event, data };
      if (this.rpc) {
        message.key = ulid();
        this._callbacks[message.key] = resolve;
      }

      this._send(message).then(resolve, reject);
    });
  }

  public subscribe(events: string | string[]): Promise<void> {
    if (Array.isArray(events)) for (const event of events) this._events.add(event);
    else this._events.add(events);
    return Promise.resolve();
  }

  public unsubscribe(events: string | string[]): Promise<void> {
    if (Array.isArray(events)) for (const event of events) this._events.delete(event);
    else this._events.delete(events);
    return Promise.resolve();
  }

  private _send(message: IpcMessage): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      if (this.child) {
        this.child.send(message, (err) => {
          if (err) {
            reject(err);
            if (message.key && this._callbacks[message.key]) delete this._callbacks[message.key];
          } else if (!this.rpc) {
            resolve();
          }
        });
      } else if (process.send) {
        process.send(message);
        resolve();
      } else {
        reject(new Error('no child'));
      }
    });
  }
}
