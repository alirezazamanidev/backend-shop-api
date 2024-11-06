import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsNotEmpty, IsNumberString, IsOptional, IsString } from "class-validator";


export class CreateCategoryDto {
    @ApiProperty()
    @IsNotEmpty()
    name:string
    @ApiPropertyOptional()
    @IsOptional()
    @IsNumberString({})
    parentId?: number;
    @ApiPropertyOptional({type:'string',format:'binary'})
    @IsOptional()
    image:Express.Multer.File
}