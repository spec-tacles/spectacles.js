import { Redis } from '../src';
import RedisClient = require('ioredis');

const client = new RedisClient({ showFriendlyErrorStack: true });
const broker = new Redis('test', client, { rpc: true });
const broker2 = new Redis('test', client, { rpc: true });

client.flushdb();

broker.on('meme', (msg, { ack, reply }) => {
  console.log('receive', msg);
  ack();
  reply('toasty');
});

broker2.publish('meme', { meme: 'hello world' }, { timeout: 5000 }).then(console.log.bind(null, 'reply'));
