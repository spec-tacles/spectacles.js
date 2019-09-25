import Snowflake from './Snowflake';

test('begins 0', () => {
	const s = new Snowflake();
	expect(s.valueOf()).toBe(0n);
});

test('default epoch is Discord', () => {
	expect(Snowflake.EPOCH).toBe(1420070400000);
});

test('sets created at', () => {
	const s = new Snowflake();
	const time = new Date('2019-09-25T23:19:29.709Z');
	s.createdAt = time;
	expect(s.createdAt.valueOf()).toBe(time.valueOf());
	expect(s.valueOf()).toBe(626558426243137536n);
});

test('sets worker id', () => {
	const s = new Snowflake();
	const id = 31;
	s.workerID = id;
	expect(s.workerID).toBe(id);
	expect(s.valueOf()).toBe(4063232n);
});

test('sets process id', () => {
	const s = new Snowflake();
	const pid = 31;
	s.processID = pid;
	expect(s.processID).toBe(pid);
	expect(s.valueOf()).toBe(126976n);
});

test('sets increment', () => {
	const s = new Snowflake();
	s.increment++;
	expect(s.increment).toBe(1);
	expect(s.valueOf()).toBe(1n);
});
