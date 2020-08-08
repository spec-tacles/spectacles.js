import Permissions from './Permissions';

test('begins 0', () => {
	const p = new Permissions();
	expect(p.bitfield).toBe(0);
});

test('adds permissions', () => {
	const p = new Permissions();
	for (const perm of Object.values(Permissions.FLAGS)) {
		p.add(perm);
		expect(p.has(perm)).toBe(true);
	}
});

test('can be constructed with permissions', () => {
	const p = new Permissions(Permissions.ALL);
	expect(p.has(Permissions.ALL)).toBe(true);
});

test('adds admin permissions', () => {
	const p = new Permissions(Permissions.FLAGS.ADMINISTRATOR);
	expect(p.has(Permissions.FLAGS.ADMINISTRATOR)).toBe(true);
	expect(p.isAdmin).toBe(true);
});

test('removes permissions', () => {
	const p = new Permissions(Permissions.ALL);
	p.remove(Permissions.FLAGS.ADMINISTRATOR);
	for (const perm of Object.values(Permissions.FLAGS)) {
		if (perm === Permissions.FLAGS.ADMINISTRATOR) {
			expect(p.has(perm)).toBe(false);
			expect(p.isAdmin).toBe(false);
		} else {
			expect(p.has(perm)).toBe(true);
		}
	}
});
