import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsString, Length } from "class-validator";

export class LoginDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(3,20)
    username:string
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    @Length(4,20)
    password:string
}