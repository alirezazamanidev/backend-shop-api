import { BaseEntity } from 'src/common/abstracts';
import { EntityNames } from 'src/common/enums';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';

@Entity(EntityNames.User)
export class UserEntity extends BaseEntity {
  @Column({ unique: true })
  phone: string;
  @Column({ unique: true, nullable: true })
  username: string;
  @Column({ nullable: true })
  fullname: string;
  @Column({ default: false })
  phone_verify: boolean;
  @Column()
  invite_code: string;
  @Column({ nullable: true })
  referrerId: number;
  @CreateDateColumn()
  created_at: Date;
  @UpdateDateColumn()
  updated_at: Date;
  // realations
  @ManyToOne(() => UserEntity, (user) => user.invitedUsers, { nullable: true })
  referrer: UserEntity;
  @OneToMany(() => UserEntity, (user) => user.referrer)
  invitedUsers: UserEntity[];
}
