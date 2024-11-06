import {
  Body,
  Controller,
  FileTypeValidator,
  HttpCode,
  HttpStatus,
  MaxFileSizeValidator,
  ParseFilePipe,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { ContentType } from 'src/common/enums';
import { UploadFileS3 } from 'src/common/interceptors';

@ApiTags('Categoery')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}

  @ApiOperation({ summary: 'create new category' })
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  @UseInterceptors(UploadFileS3('image'))
  @ApiConsumes(ContentType.MULTIPART)
  create(
    @Body() categoryDto: CreateCategoryDto,
    @UploadedFile(
      new ParseFilePipe({
        fileIsRequired: false,
        validators: [
          new FileTypeValidator({ fileType: /(jpg|jpeg|png)$/ }),
          new MaxFileSizeValidator({ maxSize: 2 * 1024 * 1024 }),
        ],
      }),
    )
    image: Express.Multer.File,
  ) {
    return this.categoryService.create(categoryDto, image);
  }
}
