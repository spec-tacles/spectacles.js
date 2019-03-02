import { Ipc } from '../src';

const server = new Ipc();
server.subscribe('hello');
server.on('hello', m => console.log(m));
server.publish('foo', 'bar');
