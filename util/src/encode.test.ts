import { encode, decode } from './encode';
import {
	null as fuzzyNull,
	boolean,
	object,
	string,
	array,
} from '@devsnek/fuzzy';

const data = object({
	included: [
		fuzzyNull,
		boolean,
		object,
		string,
		array,
	],
});
let encoded: Buffer;

test('encodes data', () => {
	expect(() => encoded = encode(data)).not.toThrow();
	expect(encoded).toBeInstanceOf(Buffer);
});

test('decodes data', () => {
	let decoded: any;
	expect(() => decoded = decode(encoded)).not.toThrow();
	expect(decoded).toEqual(data);
});
