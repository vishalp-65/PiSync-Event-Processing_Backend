import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Request } from 'express';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest<Request>();
    const { method, url, body } = request;
    const now = Date.now();

    this.logger.log(`${method} ${url} - Started`);

    return next.handle().pipe(
      tap({
        next: (response) => {
          const duration = Date.now() - now;
          this.logger.log(`${method} ${url} - Completed in ${duration}ms`);
        },
        error: (error) => {
          const duration = Date.now() - now;
          this.logger.error(
            `${method} ${url} - Failed in ${duration}ms: ${error.message}`,
          );
        },
      }),
    );
  }
}
