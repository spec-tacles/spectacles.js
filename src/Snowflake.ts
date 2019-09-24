export default class Snowflake {
	public static EPOCH = 1420070400000;
	public static WORKER_ID = 0n;
	public static INCREMENT = 0n;

	protected bin: bigint;

	constructor(bin?: bigint | string) {
		if (typeof bin === 'bigint') {
			this.bin = bin;
		} else if (typeof bin === 'string') {
			this.bin = BigInt(bin);
		} else {
			this.bin = Snowflake.INCREMENT++
				| BigInt(process.pid << 12)
				| (Snowflake.WORKER_ID << 17n)
				| (BigInt(Date.now() - Snowflake.EPOCH) << 22n);
		}
	}

	public get createdAt(): Date {
		const d = new Date();
		d.setMilliseconds(Number(this.bin >> 22n) + Snowflake.EPOCH);
		return d;
	}

	public get workerID(): number {
		return Number((this.bin & 0x3E0000n) >> 17n);
	}

	public get processID(): number {
		return Number((this.bin & 0x1F000n) >> 12n);
	}

	public get increment(): number {
		return Number(this.bin & 0xFFFn);
	}

	public valueOf(): bigint {
		return this.bin;
	}
}
