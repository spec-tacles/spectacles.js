const { Redis } = require('../dist');
const RedisClient = require('ioredis');

const client = new RedisClient({ showFriendlyErrorStack: true });
const broker = new Redis('test', client);
const broker2 = new Redis('test', client);

client.flushdb();

broker.on('meme', (msg, { ack }) => {
  console.log('receive', msg);
  ack();
});

broker2.publish('meme', { meme: 'hello world' });
