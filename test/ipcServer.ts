import { Ipc } from '../src';

const server = new Ipc();
server.subscribe('hello', (event, m) => console.log(event, m));
server.publish('foo', 'bar');
