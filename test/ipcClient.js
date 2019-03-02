const { fork } = require('child_process');
const { Ipc } = require('../dist');

const client = new Ipc(fork('./test/ipcServer'));
client.publish('hello', 'world');
client.subscribe('foo');
client.on('foo', m => console.log(m));
