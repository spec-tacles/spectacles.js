import Amqp from './Amqp';

describe('constructor', () => {
	test('defaults', () => {
		const amqp = new Amqp();
		expect(amqp.channel).toBeUndefined();
		expect(amqp.callback).toBeUndefined();
		expect(amqp.group).toBe('default');
		expect(amqp.subgroup).toBeUndefined();
		expect(amqp.options).toStrictEqual({});
	});

	test('group only', () => {
		const amqp = new Amqp('foo');
		expect(amqp.group).toBe('foo');
		expect(amqp.subgroup).toBeUndefined();
	});

	test('group and subgroup', () => {
		const amqp = new Amqp('foo', 'bar');
		expect(amqp.group).toBe('foo');
		expect(amqp.subgroup).toBe('bar');
	});

	test('group and options', () => {
		const options = {};
		const amqp = new Amqp('foo', options);
		expect(amqp.group).toBe('foo');
		expect(amqp.subgroup).toBeUndefined();
		expect(amqp.options).toBe(options);
	});

	test('group, subgroup, and options', () => {
		const options = {};
		const amqp = new Amqp('foo', 'bar', options);
		expect(amqp.group).toBe('foo');
		expect(amqp.subgroup).toBe('bar');
		expect(amqp.options).toBe(options);
	});
});
