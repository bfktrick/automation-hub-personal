import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { RequestContext } from '../request-context/request-context';

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
  requestId?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    const requestId = RequestContext.get('requestId');

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object') {
        const objResponse = exceptionResponse as any;
        message = objResponse.message || exception.message;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      // Handle Prisma errors
      const err = exception as any;

      if (err.code === 'P2002') {
        // Unique constraint violation
        status = HttpStatus.CONFLICT;
        message = 'Unique constraint violation';
      } else if (err.code === 'P2025') {
        // Record not found
        status = HttpStatus.NOT_FOUND;
        message = 'Record not found';
      } else if (err.code === 'P2003') {
        // Foreign key constraint violation
        status = HttpStatus.BAD_REQUEST;
        message = 'Invalid reference';
      } else {
        message = err.message || 'Internal server error';
      }
    }

    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...(requestId && { requestId }),
    };

    response.status(status).json(errorResponse);
  }
}
