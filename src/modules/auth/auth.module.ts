import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { RedisService } from '../redis/redis.service';
import { JwtModule } from '@nestjs/jwt';
import { TokenService } from './token.service';
import { ThrottlerModule } from '@nestjs/throttler';

@Module({
  imports:[UserModule,JwtModule.register({global:true}),ThrottlerModule],
  controllers: [AuthController],
  providers: [AuthService,RedisService,TokenService],
})
export class AuthModule {}
