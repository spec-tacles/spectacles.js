const { Amqp } = require('../dist');
const broker = new Amqp('test');
(async () => {
  await broker.connect('localhost');
  broker.on('meme', (data, { ack, reply }) => {
    console.log('call', data);
    ack();
    // reply('wassup');
  });
  await broker.subscribe('meme');
  console.log('back', await broker.publish('meme', 'hey der'));
})();
