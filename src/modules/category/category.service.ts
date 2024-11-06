import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { DataSource, DeepPartial, Repository } from 'typeorm';
import { CreateCategoryDto } from './dtos/create-category.dto';
import slugify from 'slugify';
import { S3Service } from 'src/app/plugins/s3.service';
import { CategoryImageEntity } from './entities/category-image.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
    private s3Service: S3Service,
    private readonly dataSourse: DataSource,
  ) {}

  async create(dto: CreateCategoryDto, image: Express.Multer.File) {
    const { name, parentId } = dto;

    let createObject: DeepPartial<CategoryEntity> = {};
    createObject['name'] = await this.checkExistByName(name);
    createObject['slug'] = slugify(name, {
      replacement: '_',
      lower: true,
      trim: true,
    });
    if (parentId) {
      createObject['parent'] = await this.findOneById(parentId);
    }
    return await this.dataSourse.transaction(async (manager) => {
      const newCategory = await manager.save(CategoryEntity, createObject);

      // uploaad images
      const { Url, key } = await this.s3Service.upload(
        image,
        'category/images',
      );
      await manager.insert(CategoryImageEntity, {
        categoryId: newCategory.id,
        fieldname: image.fieldname,
        originalname: image.originalname,
        size: image.size,
        mimetype: image.mimetype,
        path: Url,
        key: key,
      });
      return {
        message: 'created',
        category_id: newCategory.id,
      };
    });
  }
  async findOneById(id: number) {
    const category = await this.categoryRepository.findOneBy({ id });
    if (!category) throw new NotFoundException('category not founded!');
    return category;
  }
  async checkExistByName(name: string) {
    const category = await this.categoryRepository.findOneBy({ name });
    if (category) throw new ConflictException('category name already exist!');
    return name;
  }
}
