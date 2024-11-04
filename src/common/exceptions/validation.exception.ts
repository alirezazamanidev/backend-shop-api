import { UnprocessableEntityException } from '@nestjs/common';

export default class ValidationException extends UnprocessableEntityException {
  constructor(public validationErrors: object[] | string[]) {
    super();
  }
}
