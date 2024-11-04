import { ExceptionFilter } from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

import ValidationFilter from './validation.filter';
import { AllExceptionFilter } from './all-exception.filter';
export const getGlobalFilters = (
  httpAdapter: HttpAdapterHost,
): ExceptionFilter<any>[] => [
    new ValidationFilter(),
  new AllExceptionFilter(httpAdapter),
];
