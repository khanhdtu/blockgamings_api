import {BindingScope, injectable, service} from '@loopback/core';
import {LogError} from '@loopback/rest';
import {HoneyLogServiceService} from '../services';

@injectable({scope: BindingScope.SINGLETON})
export class LogErrorProvider {
  constructor(
    @service(HoneyLogServiceService)
    protected honeyLogService: HoneyLogServiceService,
  ) {}
  public value(): LogError {
    const logError: LogError = (err, statusCode, req) => {
      if (statusCode < 500) {
        return;
      }

      this.honeyLogService.notify(err);
      console.error(
        'Request %s %s failed with status code %s. %s',
        req.method,
        req.url,
        statusCode,
        err.stack ?? err,
      );
    };
    return logError;
  }
}
