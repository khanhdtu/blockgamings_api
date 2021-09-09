import {injectable, /* inject, */ BindingScope} from '@loopback/core';
// Using Honeybadger logging system
import Honeybadger from '@honeybadger-io/js';

@injectable({scope: BindingScope.SINGLETON})
export class HoneyLogServiceService {
  constructor() {
    Honeybadger.configure({
      apiKey: '4e8326ff', // TODO: load apiKey from .env
    });
  }

  public notify(e: Error): void {
    Honeybadger.notify(e);
  }

  public errorHandler(err: never, req: never, _res: never, next: never): void {
    Honeybadger.errorHandler(err, req, _res, next);
  }

  public handleRequest(req: never, res: never, next: never): void {
    Honeybadger.requestHandler(req, res, next);
  }
}
