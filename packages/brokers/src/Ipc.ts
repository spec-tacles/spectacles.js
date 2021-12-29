import Broker from './Base';
import { ChildProcess, fork, ForkOptions } from 'child_process';
import { ulid } from 'ulid';

export interface IpcMessage {
  event: string;
  data: any;
  key?: string;
}

export default class Ipc<T = any> extends Broker<T> {
  public children: ChildProcess[] = [];
  private _nextChildIndex = 0;
  private _messageHandler = (message: IpcMessage) => {
    if (message.key) this._handleReply(message.key, message.data);
    else this._handleMessage(message.event, message.data, {
      reply: data => this._send({ event: message.event, data, key: message.key }),
    });
  };

  constructor() {
    super();
    process.on('message', this._messageHandler);
  }

  public fork(proc: ChildProcess): void;
  public fork(dir: string, args?: ReadonlyArray<string>, options?: ForkOptions): void;
  public fork(dir: string | ChildProcess, args?: ReadonlyArray<string>, options?: ForkOptions): void {
    const child = typeof dir === 'string' ? fork(dir, args, options) : dir;
    child.on('message', this._messageHandler);
    this.children.push(child);
  }

  public publish(event: string, data: any): Promise<unknown> {
    return this._send({ event, data });
  }

  public call(method: string, data: T): Promise<unknown> {
    const key = ulid();
    this._send({ event: method, data, key });
    return this._awaitResponse(key);
  }

  protected _subscribe(): void {
    // do nothing
  }

  protected _unsubscribe(): void {
    // do nothing
  }

  private _nextChild(): ChildProcess | null {
    if (!this.children.length) return null;
    if (this._nextChildIndex >= this.children.length) this._nextChildIndex = 0;
    return this.children[this._nextChildIndex++];
  }

  private _send(message: IpcMessage): Promise<void> {
    return new Promise<void>((resolve, reject) => {
      const child = this._nextChild();
      if (child) {
        child.send(message, (err) => {
          if (err) reject(err)
          else resolve();
        });
      } else if (process.send) {
        process.send(message);
        resolve();
      } else {
        reject(new Error('no children spawned and this is not a child process'));
      }
    });
  }
}
