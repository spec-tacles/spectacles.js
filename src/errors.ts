export enum Codes {
  NO_GATEWAY,
  NO_WEBSOCKET,
  NO_SESSION,
  INVALID_ENCODING,
  ALREADY_SPAWNED,
};

export const Messages = {
  [Codes.NO_WEBSOCKET]: 'No existing websocket connection to use.',
  [Codes.NO_GATEWAY]: 'No gateway to connect to.',
  [Codes.NO_SESSION]: 'No session to available.',
  [Codes.INVALID_ENCODING]: 'Invalid encoding specified.',
  [Codes.ALREADY_SPAWNED]: 'Shards have already been spawned.',
};

export class Error extends global.Error {
  public readonly code: Codes;

  constructor(code: Codes) {
    super(Messages[code]);
    this.code = code;
  }
}
