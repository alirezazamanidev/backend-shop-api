import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ApiConsumes, ApiOperation } from '@nestjs/swagger';
import { SendOtpDto } from './dtos/auth.dto';
import { ContentType } from 'src/common/enums';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @ApiOperation({summary:'Send Otp Code'})
  @HttpCode(HttpStatus.OK)
  @Post('send-otp')
  @ApiConsumes(ContentType.URL_ENCODED,ContentType.JSON)
  sendOtp(@Body() userDto:SendOtpDto){
    return this.authService.sendOtp(userDto);
  }
}
