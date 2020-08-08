import { Ipc } from '../src';
import { resolve } from 'path';

const client = new Ipc();
client.fork(resolve(process.cwd(), 'dist', 'test', 'ipcServer'));
client.on('foo', (e) => console.log('foo', e));
client.subscribe('foo');
client.publish('hello', 'world');
