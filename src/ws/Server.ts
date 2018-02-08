import Broker from '../Base';
import * as WebSocket from 'ws';
import Connection from './Connection';
import { encode, decode } from '@spectacles/util';

export default class Server extends Broker {
  public clients: Connection[] = [];

  private _ws?: WebSocket.Server;
  private _currentConnection: number = 0;

  public get connection(): Connection {
    return this.clients[
      this._currentConnection < this.clients.length
      ? this._currentConnection++
      : this._currentConnection = 0
    ];
  }

  public get ws() {
    if (!this._ws) throw new Error('no websocket');
    return this._ws;
  }

  public connect(url: string) {
    this._ws = new WebSocket.Server({
      host: url,
    });

    this._ws.on('connection', (socket) => {
      const conn = new Connection(socket, this);
      this.clients.push(conn);
      socket.once('close', () => this.clients.splice(this.clients.indexOf(conn), 1));
    });

    return new Promise(r => this.ws.once('listening', r));
  }

  public publish(event: string, data: any) {
    return this.connection.send(encode({ op: event, d: data }));
  }
}
