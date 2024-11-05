import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { RedisService } from '../redis/redis.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { ThrottlerModule } from '@nestjs/throttler';
import { AtStrategy } from './strategies/at.strategy';

@Module({
  imports:[UserModule,JwtModule.register({global:true}),ThrottlerModule],
  controllers: [AuthController],
  providers: [AuthService,RedisService,TokenService,AtStrategy],
})
export class AuthModule {}
