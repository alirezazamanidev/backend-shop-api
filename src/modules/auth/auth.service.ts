import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { DataSource, EntityManager, Repository } from 'typeorm';
import { CheckOtpDto, RefreshTokenDto, SendOtpDto } from './dtos/auth.dto';
import { RedisService } from '../redis/redis.service';
import { randomInt, randomUUID } from 'crypto';
import { TokenService } from './token.service';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
    private readonly redisService: RedisService,
    private readonly tokenService: TokenService,
    private readonly dataSourse: DataSource,
  ) {}

  async sendOtp(userDto: SendOtpDto) {
    let { phone, referrer_code } = userDto;

    return await this.dataSourse.transaction(async (manager) => {
      let user = await manager.findOneBy(UserEntity, { phone });
      if (!user) {
        user = manager.create(UserEntity, { phone, invite_code: randomUUID() });
        user = await manager.save(UserEntity, user);

        if (referrer_code) {
          await this.setReferrerUser(referrer_code, user, manager);
        }
      }
      let otpCode = await this.createOtpForUser(phone);

      return {
        message: 'Sent otp Code successFully',
        code: otpCode,
      };
    });
  }
  async setReferrerUser(
    referrer_code: string,
    user: UserEntity,
    manager: EntityManager,
  ) {
    let referrer = await manager.findOne(UserEntity, {
      where: { invite_code: referrer_code },
      relations: { invitedUsers: true, referrer: true },
    });
    if (!referrer) throw new NotFoundException('referrer_code not founded!');
    referrer.invitedUsers.push(user);
    user.referrerId = referrer.id;
    await manager.save(UserEntity, user);
    await manager.save(UserEntity, referrer);
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

  async refreshTokens(rtDto: RefreshTokenDto) {
    let { refresh_token } = rtDto;
    let { phone } = this.tokenService.verifyRt(refresh_token);

    // Check if the refresh token is in Redis
    const storedToken = await this.redisService.get(`rt_token:${phone}`);
    if (!storedToken || storedToken !== refresh_token) {
      throw new UnauthorizedException(
        'Refresh token is invalid or has expired',
      );
    }
    // generate new access and refresh tokens
    let tokens = await this.tokenService.generateJWTTokens(phone);
    // Invalidate the old refresh token
    await this.redisService.del(`rt_token:${phone}`);

    // Store the new refresh token in Redis
    await this.redisService.set(
      `rt:${phone}`,
      tokens.refresh_token,
      process.env.REFRESH_TOKEN_TIME_EXPIRED,
    );

    return tokens;
  }
  async getPaylodUser(phone: string) {
    let user = await this.userRepository.findOne({
      where: { phone },
      select: {
        
        id: true,
        username: true,
        fullname: true,
        phone_verify: true,
        created_at: true,
      },
    });
    if (!user) throw new NotFoundException('user not founded!');
    return user;
  }
}
