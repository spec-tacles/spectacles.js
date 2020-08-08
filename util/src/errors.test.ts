import * as errors from './errors';


test('is error', () => {
	const err = new errors.Error(0);
	expect(err).toBeInstanceOf(errors.Error);
	expect(err).toBeInstanceOf(Error);
});

test('has codes', () => {
	for (const code of [
		errors.Codes.NO_GATEWAY,
		errors.Codes.NO_WEBSOCKET,
		errors.Codes.NO_SESSION,
		errors.Codes.INVALID_ENCODING,
		errors.Codes.ALREADY_SPAWNED,
	]) {
		const err = new errors.Error(code);
		expect(err.code).toBe(code);
		expect(err.message).toBe(errors.Messages[code]);
	}
})
