import { Ipc } from '../src';

const server = new Ipc();
server.on('hello', e => console.log('hello', e));
server.subscribe('hello');
server.publish('foo', 'bar');
