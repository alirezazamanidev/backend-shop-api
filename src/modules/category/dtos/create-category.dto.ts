import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";


export class CreateCategoryDto {
    @ApiProperty()
    @IsNotEmpty()
    @IsString()
    name:string

    @ApiPropertyOptional()
    @IsOptional()
    @IsNumberString({})
    parentId?: number;
}