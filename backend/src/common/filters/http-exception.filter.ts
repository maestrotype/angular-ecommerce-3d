import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Safely determine status code
    let status: number;
    let message: string | object;
    let errorType: string;

    try {
      if (this.isHttpException(exception)) {
        status = exception.getStatus();
        message = exception.getResponse();
        errorType = 'HttpException';
      } else if (this.isError(exception)) {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.message || 'Internal server error';
        errorType = 'Error';
      } else {
        status = HttpStatus.INTERNAL_SERVER_ERROR;
        message = 'Unknown error occurred';
        errorType = 'Unknown';
      }
    } catch (filterError) {
      // If our filter fails, use safe defaults
      status = HttpStatus.INTERNAL_SERVER_ERROR;
      message = 'Critical error in error handling';
      errorType = 'FilterError';
      this.logger.error('Exception filter failed:', filterError);
    }

    // Log the error details for debugging
    this.logger.error(`Exception caught by AllExceptionsFilter:`, {
      errorType,
      status,
      message,
      path: request.url,
      method: request.method,
      timestamp: new Date().toISOString(),
      userAgent: request.get('User-Agent'),
      ip: request.ip,
    });

    // Create safe response object
    const responseBody = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      message: this.extractMessage(message),
      error: errorType,
    };

    // Send response
    response.status(status).json(responseBody);
  }

  private isHttpException(exception: unknown): exception is HttpException {
    try {
      return exception instanceof HttpException;
    } catch {
      return false;
    }
  }

  private isError(exception: unknown): exception is Error {
    try {
      return exception instanceof Error;
    } catch {
      return false;
    }
  }

  private extractMessage(message: string | object): string {
    try {
      if (typeof message === 'string') {
        return message;
      }
      
      if (typeof message === 'object' && message !== null) {
        const messageObj = message as any;
        if (messageObj.message) {
          return String(messageObj.message);
        }
        if (messageObj.error) {
          return String(messageObj.error);
        }
      }
      
      return 'An error occurred';
    } catch {
      return 'An error occurred';
    }
  }
} 