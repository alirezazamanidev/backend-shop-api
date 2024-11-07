import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { appIntervalImports } from '../app/imports/internal.imports';
import { appPluginImports } from '../app/imports/plugins.import';
import { EnvEnum } from 'src/common/enums';
import * as session from 'express-session';
import RedisStore from 'connect-redis'
import { createClient } from 'redis';
@Module({
  imports: [...appPluginImports, ...appIntervalImports],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    const redisClient = createClient({
      url: `redis://${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`, // Redis server URL
    });

    redisClient.connect().catch(console.error);

    consumer
      .apply(
        session({
          name:'admin_session_token',
          store: new RedisStore({
            client: redisClient, // اتصال به Redisو
            
          }),
        
          secret: process.env.SECRET_SESSION_KEY, // کلید رمزنگاری سشن
          resave: false, // اگر تغییراتی در سشن نباشد، ذخیره نشود
          saveUninitialized: false, // اگر سشن جدید است، ذخیره شود
         cookie:{
          httpOnly:true,
          secure:process.env.NODE_ENV===EnvEnum.Production,
          path:'/'
         },
         rolling:true
        }),
      )

      .forRoutes('/admin');
  }
}
