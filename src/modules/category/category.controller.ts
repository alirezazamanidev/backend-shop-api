import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CategoryService } from './category.service';
import { ApiConsumes, ApiOperation, ApiTags } from '@nestjs/swagger';
import { CreateCategoryDto } from './dtos/create-category.dto';
import { ContentType } from 'src/common/enums';

@ApiTags('Categoery')
@Controller('category')
export class CategoryController {
  constructor(private readonly categoryService: CategoryService) {}


  @ApiOperation({summary:'create new category'})
  @HttpCode(HttpStatus.CREATED)
  @Post('create')
  @ApiConsumes(ContentType.URL_ENCODED,ContentType.JSON)
  create(@Body() categoryDto:CreateCategoryDto){
 
    return this.categoryService.create(categoryDto)

  }
}
