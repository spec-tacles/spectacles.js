import { encode as mEncode, decode as mDecode } from '@msgpack/msgpack';

export function encode(data: any): Buffer {
  if (Buffer.isBuffer(data)) return data;
  return Buffer.from(mEncode(data));
}

export function decode(data: ArrayBuffer | string | Buffer[] | Buffer | Uint8Array): unknown {
  if (typeof data === 'string') data = Buffer.from(data);
  else if (Array.isArray(data)) data = Buffer.concat(data);

  return mDecode(data);
}
