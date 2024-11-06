import { BaseEntity } from 'src/common/abstracts';
import { EntityNames } from 'src/common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToOne,
  Tree,
  TreeChildren,
  TreeParent,
  UpdateDateColumn,
} from 'typeorm';
import { CategoryImageEntity } from './category-image.entity';

@Entity(EntityNames.Category)
@Tree('materialized-path')
export class CategoryEntity extends BaseEntity {
  @Column()
  name: string;
  @Column({ unique: true })
  slug: string;
  @TreeChildren()
  children: CategoryEntity[];
  @TreeParent()
  parent: CategoryEntity;
  @OneToOne(() => CategoryImageEntity, (image) => image.category)
  image: CategoryImageEntity;

  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
