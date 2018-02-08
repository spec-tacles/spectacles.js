import * as WebSocket from 'ws';
import { encode, decode } from '@spectacles/util';
import Broker from '../Base';

export default class Connection {
  public heartbeater: NodeJS.Timer;
  private _ws: WebSocket;
  private _acked: boolean = true;

  constructor(ws: WebSocket, broker: Broker) {
    this._ws = ws;

    this.heartbeater = setInterval(() => {
      if (this._acked) {
        ws.ping();
        this._acked = false;
      } else {
        ws.close();
      }
    }, 45e3);

    ws.once('close', () => clearInterval(this.heartbeater));
    ws.on('ping', () => ws.pong());
    ws.on('pong', () => this._acked = true);
    ws.on('message', data => {
      const decoded = decode<{ op: string, d: any }>(data);
      if (broker.events.has(decoded.op)) broker.emit(decoded.op, decoded.d);
    });
  }

  public get ws() {
    if (!this._ws) throw new Error('no websocket');
    return this._ws;
  }

  public send(data: any) {
    return new Promise((resolve, reject) => {
      this.ws.send(encode(data), err => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  public close(code?: number, data?: string) {
    this.ws.close(code, data);
    return new Promise(r => this.ws.once('close', r));
  }
}
