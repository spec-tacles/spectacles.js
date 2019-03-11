import { Redis } from '../src';
import RedisClient = require('ioredis');

const client = new RedisClient({ showFriendlyErrorStack: true });
const broker = new Redis('test', client);
const broker2 = new Redis('test', client);

client.flushdb();

broker.subscribe('meme', (event, message) => {
  console.log(event, message);
  return 'toasty';
});

broker2.call('meme', { meme: 'hello world' }, { timeout: 5000 }).then((msg) => console.log('reply', msg));
