import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { RedisService } from '../redis/redis.service';

@Module({
  imports:[UserModule],
  controllers: [AuthController],
  providers: [AuthService,RedisService],
})
export class AuthModule {}
