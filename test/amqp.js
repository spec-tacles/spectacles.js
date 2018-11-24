const { Amqp } = require('../dist');

const broker = new Amqp('test', 'subtest', { rpc: true });
const broker2 = new Amqp('test', { rpc: true });

(async () => {
  await broker.connect('localhost');
  await broker2.connect('localhost');
  console.log('connected');

  broker.on('meme', (data, { ack, reply }) => {
    console.log('call', data);
    ack();
    reply('wassup');
  });

  broker2.on('meme', (data, { ack, reply }) => {
    console.log('call2', data);
    ack();
    reply('wassup2');
  });

  console.log('back', await broker.publish('meme', 'hey der'));
})();
