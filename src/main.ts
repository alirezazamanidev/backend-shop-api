import './configs/env.config'
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { AppIntilizer } from './app';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  AppIntilizer(app);
  
  let { APP_PORT } = process.env;
  await app.listen(APP_PORT, () => {
    console.log(`server run at port : ${APP_PORT}`);
    console.log(`swagger run at http://localhost:${APP_PORT}/doc`);
  });
}
bootstrap();
