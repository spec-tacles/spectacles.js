import { fork } from 'child_process';
import { Ipc } from '../src';

const client = new Ipc(fork('./test/ipcServer'));
client.publish('hello', 'world');
client.subscribe('foo');
client.on('foo', m => console.log(m));
