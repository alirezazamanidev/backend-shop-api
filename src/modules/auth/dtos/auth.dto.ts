import { ApiProperty } from '@nestjs/swagger';
import {
  IsMobilePhone,
  IsNotEmpty,
  IsNumberString,
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
