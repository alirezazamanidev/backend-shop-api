import { ApiProperty } from '@nestjs/swagger';
import {
    IsJWT,
  IsMobilePhone,
  IsNotEmpty,
  IsNumberString,
  IsString,
  Length,
} from 'class-validator';

export class SendOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMobilePhone('fa-IR')
  phone: string;
}
export class CheckOtpDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsMobilePhone('fa-IR')
  phone: string;
  @ApiProperty()
  @IsNotEmpty()
  @IsNumberString()
  @Length(5, 5)
  code: string;
}
export class RefreshTokenDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @IsJWT()
    refresh_token:string
}