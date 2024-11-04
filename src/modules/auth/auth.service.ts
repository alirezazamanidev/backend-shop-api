import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { Repository } from 'typeorm';
import { CheckOtpDto, SendOtpDto } from './dtos/auth.dto';
import { RedisService } from '../redis/redis.service';
import { randomInt } from 'crypto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
  ) {}

  async sendOtp(userDto: SendOtpDto) {
    let { phone } = userDto;

    let user = await this.userRepository.findOneBy({ phone });
    if (!user) {
      user = this.userRepository.create({ phone });
      user = await this.userRepository.save(user);
    }

    let otpCode = await this.createOtpForUser(phone);

    return {
      message: 'Sent otp Code successFully',
      code: otpCode,
    };
  }

  async createOtpForUser(phone: string) {
    let otp = await this.redisService.get(`otp:${phone}`);
    if (otp) throw new UnauthorizedException('The Otp code not expired!');
    // create otp Code
    const code = randomInt(10000, 99999).toString();
    otp = await this.redisService.set(
      `otp:${phone}`,
      code,
      process.env.OTP_TIME_EXPIRED,
    );
    return code;
  }
  async checkOtp(userDto: CheckOtpDto) {
    let { phone, code } = userDto;
    // check otp
    const otpCode = await this.redisService.get(`otp:${phone}`);
    if (!otpCode)
      throw new UnauthorizedException('The Otp Code has beeen expired!');
    if (otpCode !== code)
      throw new UnauthorizedException('The Otp code is Incorect!');
    // create jwt tokens
    let tokens = await this.tokenService.generateJWTTokens(phone);
    // set black list
    await this.redisService.set(
      `rt_token:${phone}`,
      tokens.refresh_token,
      process.env.REFRESH_TOKEN_TIME_EXPIRED,
    );

    return {
      message: 'LoggedIn successFully',
      tokens,
    };
  }
}
