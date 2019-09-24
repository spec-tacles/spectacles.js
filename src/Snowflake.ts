export default class Snowflake {
	public static EPOCH = 1420070400000;
	public static WORKER_ID = 0;
	public static INCREMENT = 0;

	protected bin: bigint;

	constructor(bin?: bigint | string) {
		if (typeof bin === 'bigint') {
			this.bin = bin;
		} else if (typeof bin === 'string') {
			this.bin = BigInt(bin);
		} else {
			if (Snowflake.INCREMENT > 0xFFF) Snowflake.INCREMENT = 0;
			this.bin = BigInt(Snowflake.INCREMENT++)
				| BigInt(process.pid << 12)
				| BigInt(Snowflake.WORKER_ID << 17)
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
