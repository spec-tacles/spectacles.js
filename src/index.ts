let erlpack: { pack: (d: any) => Buffer, unpack: (d: Buffer | Uint8Array) => any } | void;
try {
  erlpack = require('erlpack');
} catch (e) {
  // do nothing
}

import * as Errors from './errors';
import * as Constants from './constants';
import Permissions from './Permissions';

export {
  Errors,
  Constants,
  Permissions,
};

export const encoding = erlpack ? 'etf' : 'json';

export function encode(data: any): Buffer {
  if (Buffer.isBuffer(data)) return data;
  return erlpack ? erlpack.pack(data) : Buffer.from(JSON.stringify(data));
}

export function decode<T = any>(data: ArrayBuffer | string | Buffer[] | Buffer | Uint8Array): T {
  if (data instanceof ArrayBuffer) data = Buffer.from(data);
  else if (Array.isArray(data)) data = Buffer.concat(data);
  else if (typeof data === 'string') data = Buffer.from(data);

  return erlpack ? erlpack.unpack(data) : JSON.parse(data.toString());
}
