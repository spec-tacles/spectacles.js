# Spectacles brokers

A unified event publishing API to allow simple and powerful communication between services. Available brokers:

- AMQP - connects to an AMQP server
- Local - keeps events on a local event emitter

## How to use

```js
const { Amqp } = require('@spectacles/brokers');
const broker = new Amqp('some group name');

(async () => {
  await broker.connect('localhost');

  broker.on('some', (d, { ack, reply }) => {
    console.log(d); // meme
    ack();
    reply('cool reply 1');
  });

  broker.on('events', (d, { ack, reply }) => {
    console.log(d); // meme2
    ack();
    reply('cool reply 2');
  });

  await broker.subscribe(['some', 'events']);

  console.log(await broker.publish('some', 'meme')); // cool reply 1
  console.log(await broker.publish('events', 'meme2')); // cool reply 2
})();
```

Obviously this is intended for use across multiple separate applications, where you publish in one app and subscribe in another.
