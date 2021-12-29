import { on } from 'events';
import Redis from 'ioredis';
import RedisBroker from './Redis';

let redis: RedisBroker;

beforeAll(async () => {
	const client = new Redis();
	await client.flushdb();

	redis = new RedisBroker('foo', client);
});

describe('constructor', () => {
	test('default options', () => {
		expect(redis.blockInterval).toBe(5000);
		expect(redis.maxChunk).toBe(10);
	});
});

describe('pub/sub', () => {
	test('publishes & subscribes', async () => {
		await redis.publish('foo', 'bar');

		const iter = on(redis, 'foo');
		await redis.subscribe('foo');

		const { value: [data, options] } = await iter.next();

		expect(data).toBe('bar');
		expect(options.ack).toBeInstanceOf(Function);
		expect(options.reply).toBeInstanceOf(Function);

		await options.ack();
	});
});

afterAll(() => {
	redis.disconnect();
});
