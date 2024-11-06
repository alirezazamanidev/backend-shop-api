import { HttpAdapterHost } from '@nestjs/core';
import { NestExpressApplication } from '@nestjs/platform-express';
import SwaggerConfig from 'src/configs/swagger.config';
import * as express from 'express'
import * as cookieParser from 'cookie-parser'
import { getGlobalFilters } from 'src/common/filters';
import { ValidationPipeErorr } from 'src/common/pipes/validation.pipe';
export const AppIntilizer = (app: NestExpressApplication) => {
  app.enableCors({
    origin: '*',
    credentials: true,
  });
  const httpAdapter = app.get(HttpAdapterHost);
  app.use(express.json())
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());
  app.setGlobalPrefix('/api');
  // app.useGlobalInterceptors(new FileCleanupInterceptor());
  app.useGlobalFilters(...getGlobalFilters(httpAdapter));
  app.useGlobalPipes(new ValidationPipeErorr());
  // swagger Init 
  SwaggerConfig(app);

};
