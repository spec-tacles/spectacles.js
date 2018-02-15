const { Amqp } = require('../dist');
const broker = new Amqp('test');
(async () => {
  await broker.connect('localhost');
  broker.on('meme', (data, { ack }) => {
    console.log(data);
    // ack();
  });
  await broker.subscribe('meme');
  console.log(await broker.publish('meme', 'hey der'));
})();
