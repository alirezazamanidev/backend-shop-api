import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
} from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { CheckOtpDto, RefreshTokenDto, SendOtpDto } from './dtos/auth.dto';
import { ContentType } from 'src/common/enums';
import { Throttle } from '@nestjs/throttler';
import { UserAuth } from './decorators/auth.decorator';
import { Request } from 'express';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({ summary: 'Send Otp Code' })
  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  @ApiConsumes(ContentType.URL_ENCODED, ContentType.JSON)
  sendOtp(@Body() userDto: SendOtpDto) {
    return this.authService.sendOtp(userDto);
  }

  @ApiOperation({ summary: 'Check Otp Code' })
  @HttpCode(HttpStatus.OK)
  @Post('check-otp')
  @ApiConsumes(ContentType.URL_ENCODED, ContentType.JSON)
  checkOtp(@Body() userDto: CheckOtpDto) {
    return this.authService.checkOtp(userDto);
  }

  @ApiOperation({ summary: 'Get new access token with refresh token!' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh')
  @ApiConsumes(ContentType.URL_ENCODED, ContentType.JSON)
  @Throttle({ default: { limit: 1, ttl: 300 } })
  refreshTokens(@Body() rtDTo: RefreshTokenDto) {
    return this.authService.refreshTokens(rtDTo);
  }

  @UserAuth()
  @ApiOperation({ summary: 'get User payload' })
  @HttpCode(HttpStatus.OK)
  @Get('whoiam')
  whoiam(@Req() req: Request) {
    return req.user;
  }
}
