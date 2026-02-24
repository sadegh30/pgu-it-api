// src/common/logger/interceptors/logging.interceptor.ts
import {
  CallHandler,
  ExecutionContext,
  HttpException,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { RequestWithContext } from '../types/request-with-context.type';
import { logger } from '../winston.logger';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const req = context.switchToHttp().getRequest<RequestWithContext>();
    const start = Date.now();

    const { method, originalUrl: path, ip, requestId, user } = req;

    return next.handle().pipe(
      tap({
        next: () => {
          const durationMs = Date.now() - start;

          logger.info('Request completed', {
            requestId,
            status: 200,
            method,
            path,
            ip,
            userId: user?.id,
            durationMs,
          });
        },

        error: (err) => {
          const durationMs = Date.now() - start;

          const status = err instanceof HttpException ? err.getStatus() : 500;

          const level = status >= 500 ? 'error' : 'warn';

          logger[level]('Request failed', {
            requestId,
            status,
            method,
            path,
            ip,
            userId: user?.id,
            durationMs,
            errorMessage: err instanceof Error ? err.message : String(err),
          });
        },
      }),
    );
  }
}
