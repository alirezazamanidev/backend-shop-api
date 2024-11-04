import { ApiProperty } from "@nestjs/swagger";
import { IsMobilePhone, IsNotEmpty } from "class-validator";


export class SendOtpDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsMobilePhone('fa-IR')
    phone:string
}