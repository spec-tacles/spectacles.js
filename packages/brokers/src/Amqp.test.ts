import { encode, decode } from '@spectacles/util';
import Amqp from './Amqp';

describe('constructor', () => {
	test('defaults', () => {
		const amqp = new Amqp();
		expect(amqp.channel).toBeUndefined();
		expect(amqp.callback).toBeUndefined();
		expect(amqp.group).toBe('default');
		expect(amqp.subgroup).toBeUndefined();
		expect(amqp.options).toStrictEqual({});
		expect(amqp.serialize).toBe(encode);
		expect(amqp.deserialize).toBe(decode);
	});

	test('group only', () => {
		const amqp = new Amqp('foo');
		expect(amqp.group).toBe('foo');
		expect(amqp.subgroup).toBeUndefined();
		expect(amqp.serialize).toBe(encode);
		expect(amqp.deserialize).toBe(decode);
	});

	test('group and subgroup', () => {
		const amqp = new Amqp('foo', 'bar');
		expect(amqp.group).toBe('foo');
		expect(amqp.subgroup).toBe('bar');
		expect(amqp.serialize).toBe(encode);
		expect(amqp.deserialize).toBe(decode);
	});

	test('group and options', () => {
		const options = {};
		const amqp = new Amqp('foo', options);
		expect(amqp.group).toBe('foo');
		expect(amqp.subgroup).toBeUndefined();
		expect(amqp.options).toBe(options);
		expect(amqp.serialize).toBe(encode);
		expect(amqp.deserialize).toBe(decode);
	});

	test('group, subgroup, and options', () => {
		const options = {};
		const amqp = new Amqp('foo', 'bar', options);
		expect(amqp.group).toBe('foo');
		expect(amqp.subgroup).toBe('bar');
		expect(amqp.options).toBe(options);
		expect(amqp.serialize).toBe(encode);
		expect(amqp.deserialize).toBe(decode);
	});

	test('custom serialization', () => {
		const serialize = (d: any) => Buffer.from(d);
		const deserialize = (b: Buffer) => b.toString();
		const options = {
			serialize,
			deserialize,
		};
		const amqp = new Amqp('foo', options);
		expect(amqp.serialize).toBe(serialize);
		expect(amqp.deserialize).toBe(deserialize);
	})
});
