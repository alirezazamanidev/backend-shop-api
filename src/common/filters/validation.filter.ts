import { ArgumentsHost, ExceptionFilter, HttpException, HttpStatus, InternalServerErrorException } from "@nestjs/common";
import ValidationException from "../exceptions/validation.exception";
import { Response } from "express";

export default class ValidationFilter implements ExceptionFilter {
    catch(exception: ValidationException, host: ArgumentsHost) {
      const ctx = host.switchToHttp();
      const res: Response = ctx.getResponse<Response>();
      let statusCode: HttpStatus;
      let errorMessage:string
      let errors = [];
      if (exception instanceof HttpException) {
        statusCode = exception.getStatus();
        errorMessage = exception.message;
  
        errors = exception.validationErrors;
      } else {
        statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
        errorMessage = new InternalServerErrorException().message;
      }
      const errorResponse = {
        statusCode,
        errorMessage,
        errors,
      };
      return res.status(errorResponse.statusCode).json(errorResponse);
    }
  }
  