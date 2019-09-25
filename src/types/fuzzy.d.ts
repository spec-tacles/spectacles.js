declare module '@devsnek/fuzzy' {
	interface Options {
		maxSteps?: number;
		values?: any[];
		exclude?: Function[];
		included?: Function[];
	}

	type Random<T = any> = (options?: Options) => T;
	const fuzzy: {
		undefined: Random<undefined>,
		null: Random<null>,
		boolean: Random<boolean>;
		symbol: Random<symbol>;
		error: Random<Error>;
		number: Random<number>;
		date: Random<Date>;
		string: Random<string>;
		regexp: Random<RegExp>;
		array: Random<any[]>;
		typedArray: Random;
		map: Random<Map<any, any>>;
		weakMap: Random<WeakMap<any, any>>;
		set: Random<Set<any>>;
		weakSet: Random<WeakSet<any>>;
		bigint: Random<bigint>;
		object: Random<object>;
		arrayBuffer: Random<ArrayBuffer>;
		json: Random;
		promise: Random<Promise<any>>;
		proxy: Random;
	}
	export = fuzzy;
}
