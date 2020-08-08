# Spectacles brokers

A unified event publishing API to allow simple and powerful communication between services. Available brokers:

- AMQP - connects to an AMQP server
- Local - keeps events on a local event emitter
- Redis - connects to a Redis v5 server
- IPC - connects multiple node processes using native IPC sockets

## How to use

```js
const { Amqp } = require('@spectacles/brokers');
const broker = new Amqp('some group name');

(async () => {
  broker.on('hello', (data, { ack, reply }) => {
    ack();
    reply(`hello ${data}`);
  });

  broker.on('foo', (data, { ack }) => {
    ack();
    console.log(data);
  });

  await broker.connect('localhost');
  await broker.subscribe([
    'hello',
    'foo',
  ]);

  console.log(await broker.call('hello', 'world')); // hello world
  await broker.publish('foo', 'bar'); // bar
})();
```

Obviously this is intended for use across multiple separate applications, where you publish in one app and subscribe in another.

*Note:* When publishing data on AMQP, you should call `Amqp#createQueue(event)` for every event you intend to publish.
This will create the queue and ensure your events aren't dropped.
