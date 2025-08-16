import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const { method, url, body, user } = request;
    const userAgent = request.get('User-Agent') || '';
    const ip = request.ip;

    const now = Date.now();

    this.logger.log(
      `Incoming Request: ${method} ${url} - User: ${user?.id || 'anonymous'} - IP: ${ip} - UA: ${userAgent}`
    );

    if (body && Object.keys(body).length > 0) {
      this.logger.debug(`Request Body: ${JSON.stringify(body)}`);
    }

    return next.handle().pipe(
      tap((response) => {
        const responseTime = Date.now() - now;
        this.logger.log(
          `Response: ${method} ${url} - Status: 200 - Time: ${responseTime}ms`
        );
      }),
      catchError((error) => {
        const responseTime = Date.now() - now;
        this.logger.error(
          `Error Response: ${method} ${url} - Status: ${error.status || 500} - Time: ${responseTime}ms - Error: ${error.message}`
        );
        throw error;
      })
    );
  }
} 