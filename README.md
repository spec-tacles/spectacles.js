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
  await broker.connect('localhost');
  await broker.subscribe([
    'hello',
    'foo',
  ], (event, d) => {
    switch (event) {
      case 'hello':
        return `hello ${d}`;
      case 'foo':
        return `foo ${d}`;
    }
  });

  console.log(await broker.call('hello', 'world')); // hello world
  console.log(await broker.call('foo', 'bar')); // foo bar
})();
```

Obviously this is intended for use across multiple separate applications, where you publish in one app and subscribe in another.
