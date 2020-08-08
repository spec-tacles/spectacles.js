import Broker, { ResponseOptions } from '@spectacles/brokers';

export interface RequestOptions {
  headers?: Record<string, string>,
  query?: Record<string, string>,
}

export default class Client<ROpts extends ResponseOptions = ResponseOptions> {
  constructor(protected broker: Broker<string, unknown, ROpts>, public readonly token: string) {
    Object.defineProperty(this, 'token', { enumerable: false });
  }

  public get(path: string, options: RequestOptions = {}): Promise<unknown> {
    return this.make('GET', path, undefined, options);
  }

  public post(path: string, body: any, options: RequestOptions = {}): Promise<unknown> {
    return this.make('POST', path, body, options);
  }

  public put(path: string, body: any, options: RequestOptions = {}): Promise<unknown> {
    return this.make('PUT', path, body, options);
  }

  public patch(path: string, body: any, options: RequestOptions = {}): Promise<unknown> {
    return this.make('PATCH', path, body, options);
  }

  public delete(path: string, options: RequestOptions = {}): Promise<unknown> {
    return this.make('DELETE', path, undefined, options);
  }

  protected make(method: string, path: string, body: any, options: RequestOptions): Promise<unknown> {
    const headers: Record<string, string> = {
      Authorization: `Bot ${this.token}`,
      'X-RateLimit-Precision': 'millisecond',
      ...options.headers,
    };

    if (body != null) headers['content-type'] = 'application/json';

    return this.broker.call('REQUEST', JSON.stringify({
      method,
      path,
      body,
      query: options.query,
      headers,
    }));
  }
}
