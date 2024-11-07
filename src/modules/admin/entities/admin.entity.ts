import { BaseEntity } from 'src/common/abstracts';
import { EntityNames } from 'src/common/enums';
import { Column, CreateDateColumn, Entity, UpdateDateColumn } from 'typeorm';

@Entity(EntityNames.Admin)
export class AdminEntity extends BaseEntity {
  @Column({ unique: true })
  username: string;
  @Column()
  hashPassword: string;
  @Column()
  role: string;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
}
