import { Redis } from '../src';
import RedisClient = require('ioredis');

const client = new RedisClient({ showFriendlyErrorStack: true });
const broker = new Redis('test', client);
const broker2 = new Redis('test', client);

client.flushdb();

broker.on('meme', (message, { ack, reply }) => {
  ack();
  console.log(message);
  reply('toasty');
});

broker.subscribe('meme');

broker2.call('meme', { meme: 'hello world' }, { timeout: 5000 }).then((msg) => console.log('reply', msg));
