import {
    ExceptionFilter,
    Catch,
    ArgumentsHost,
    HttpException,
    HttpStatus,
  } from '@nestjs/common';
  import { HttpAdapterHost } from '@nestjs/core';
  @Catch()
  export class AllExceptionFilter implements ExceptionFilter {
    constructor(private readonly httpAdapterHost: HttpAdapterHost) {}
    catch(exception: unknown, host: ArgumentsHost): void {
      const { httpAdapter } = this.httpAdapterHost;
  
      const ctx = host.switchToHttp();
  
      let httpStatus: number, message: string;
    
      if (exception instanceof HttpException) {
        httpStatus = exception.getStatus();
        message = exception.message;
      } else if (exception instanceof Error) {
        httpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
        message = exception.message;
      }
      const responseBody = {
        statusCode: httpStatus,
        timestamp: new Date().toISOString(),
        errors: {
          path: httpAdapter.getRequestUrl(ctx.getRequest()),
          message,
        },
      };
  
      httpAdapter.reply(ctx.getResponse(), responseBody, httpStatus);
    }
  }
  