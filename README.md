# Spectacles brokers

A unified event publishing API to allow simple and powerful communication between services. Available brokers:

- AMQP - connects to an AMQP server
- Local - keeps events on a local event emitter

Attaching event listeners will automatically subscribe the broker to those events; make sure to attach listeners after connecting.

## How to use

```js
const { Amqp } = require('@spectacles/brokers');
const broker = new Amqp('some group name', { rpc: true });

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

  console.log(await broker.publish('some', 'meme')); // cool reply 1
  console.log(await broker.publish('events', 'meme2')); // cool reply 2
})();
```

Obviously this is intended for use across multiple separate applications, where you publish in one app and subscribe in another. Removing the RPC option will negate the need to explicitly call `reply`.
