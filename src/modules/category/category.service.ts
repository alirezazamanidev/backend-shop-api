import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CategoryEntity } from './entities/category.entity';
import { DeepPartial, Repository } from 'typeorm';
import { CreateCategoryDto } from './dtos/create-category.dto';
import slugify from 'slugify';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(CategoryEntity)
    private readonly categoryRepository: Repository<CategoryEntity>,
  ) {}

  async create(dto: CreateCategoryDto) {
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

    const newCategory = await this.categoryRepository.save(createObject);

    return {
      message: 'created',
      category_id: newCategory.id,
    };
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
