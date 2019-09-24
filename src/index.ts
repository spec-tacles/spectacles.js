import * as Errors from './errors';
import Permissions from './Permissions';

export {
  Errors,
  Permissions,
};

export function encode(data: any): Buffer {
  if (Buffer.isBuffer(data)) return data;
  return Buffer.from(JSON.stringify(data));
}

export function decode<T = any>(data: ArrayBuffer | string | Buffer[] | Buffer | Uint8Array): T {
  if (data instanceof ArrayBuffer) data = Buffer.from(data);
  else if (Array.isArray(data)) data = Buffer.concat(data);

  if (Buffer.isBuffer(data)) data = data.toString();
  else if (typeof data !== 'string') data = Buffer.from(data).toString();
  return JSON.parse(data);
}
