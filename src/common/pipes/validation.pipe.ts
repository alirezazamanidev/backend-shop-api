import { Injectable, ValidationPipe } from '@nestjs/common';
import ValidationException from '../exceptions/validation.exception';

@Injectable()
export class ValidationPipeErorr extends ValidationPipe {
  constructor() {
    super({
      validateCustomDecorators: true,
      whitelist:true,

      exceptionFactory(errors) {
        const messages: object[] = errors.map((err) => ({
          [err.property]: Object.values(err.constraints)[0],
        }));

        return new ValidationException(messages);
      },
    });
  }
}
