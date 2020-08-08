import { Amqp } from '../src';

const broker = new Amqp('test');
const broker2 = new Amqp('test', 'subtest');

broker2.on('meme', (data, { reply }) => {
  console.log('broker2', data);
  reply('wassup2');
});

broker2.on('meme2', (data, { ack }) => {
  console.log('broker2', data);
  ack();
});

(async () => {
  await broker.connect('localhost');
  await broker2.connect('localhost');
  console.log('connected');

  await broker2.subscribe(['meme', 'meme2']);

  console.log('back', await broker.call('meme', 'hey der'));
  console.log('back2', broker.publish('meme', 'hey der'));
  console.log('back3', broker.publish('meme2', 'foo'));
})();
