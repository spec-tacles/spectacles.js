import { Amqp } from '../src';

const broker = new Amqp('test', 'subtest');
const broker2 = new Amqp('test');

broker2.on('meme', (data, { reply }) => {
  console.log('broker2', data);
  reply('wassup2');
});

(async () => {
  await broker.connect('localhost');
  await broker2.connect('localhost');
  console.log('connected');

  await broker2.subscribe('meme');

  console.log('back', await broker.call('meme', 'hey der'));
  console.log('back2', broker.publish('meme', 'hey der'));
})();
