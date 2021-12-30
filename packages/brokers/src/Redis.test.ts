import { on } from 'events';
import Redis from 'ioredis';
import RedisBroker, { RedisResponseOptions } from './Redis';

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

describe('Redis connection', () => {
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

	test('responds to RPC', async () => {
		const iter = on(redis, 'foo');
		await redis.subscribe('foo');

		const rpc = redis.call('foo', 'bar');

		const { value: [value, options] }: { value: [unknown, RedisResponseOptions] } = await iter.next();
		expect(value).toBe('bar');

		await options.ack();
		await options.reply('hello');

		await expect(rpc).resolves.toBe('hello');
	});
});

afterAll(() => {
	redis.disconnect();
});
