import { Amqp } from '../src';

const broker = new Amqp('test', 'subtest');
const broker2 = new Amqp('test');

(async () => {
  await broker.connect('localhost');
  await broker2.connect('localhost');
  console.log('connected');

  await broker2.subscribe('meme', (event, data) => {
    console.log('broker2', event, data);
    return 'wassup2';
  });

  console.log('back', await broker.call('meme', 'hey der'));
  console.log('back2', await broker.publish('meme', 'hey der'));
})();
