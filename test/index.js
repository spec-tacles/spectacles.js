const { Amqp } = require('../dist');
const broker = new Amqp('test');
(async () => {
  await broker.connect('localhost');
  broker.on('meme', (data, { ack, reply }) => {
    console.log(data);
    ack();
    reply('meme reply');
  });
  await broker.subscribe('meme');
  console.log(await broker.publish('meme', 'hey der'));
})();
