import Broker from '../Base';
import * as WebSocket from 'ws';
import { encode } from '@spectacles/util';
import Connection from './Connection';

export default class Client extends Broker {
  private _connection?: Connection;

  public get connection() {
    if (!this._connection) throw new Error('no websocket');
    return this._connection;
  }

  public connect(url: string, options?: WebSocket.ClientOptions) {
    const ws = new WebSocket(url, options);
    this._connection = new Connection(ws, this);
    return new Promise(r => ws.once('open', r));
  }

  public publish(event: string, data: any) {
    return this.connection.send(encode({ op: event, d: data }));
  }
}
