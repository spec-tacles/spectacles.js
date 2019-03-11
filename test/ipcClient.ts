import { Ipc } from '../src';
import { resolve } from 'path';

const client = new Ipc();
client.fork(resolve(process.cwd(), 'dist', 'test', 'ipcServer'));
client.subscribe('foo', (event, m) => console.log(event, m));
client.publish('hello', 'world');
