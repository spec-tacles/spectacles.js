export default class Snowflake {
	public static EPOCH = 1420070400000;

	protected bin: bigint;

	constructor(bin: bigint | string = 0n) {
		if (typeof bin === 'string') this.bin = BigInt(bin);
		else this.bin = bin;
	}

	public get createdAt(): Date {
		const d = new Date();
		d.setMilliseconds(Number(this.bin >> 22n) + Snowflake.EPOCH);
		return d;
	}

	public set createdAt(d: Date) {
		this.bin |= BigInt(d.valueOf() - Snowflake.EPOCH) << 22n;
	}

	public get workerID(): number {
		return Number((this.bin & 0x3E0000n) >> 17n);
	}

	public set workerID(id: number) {
		this.bin |= BigInt(id << 17);
	}

	public get processID(): number {
		return Number((this.bin & 0x1F000n) >> 12n);
	}

	public set processID(id: number) {
		this.bin |= BigInt(id << 12);
	}

	public get increment(): number {
		return Number(this.bin & 0xFFFn);
	}

	public set increment(incr: number) {
		this.bin |= BigInt(incr);
	}

	public valueOf(): bigint {
		return this.bin;
	}
}
