import { Injectable } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminEntity } from '../entities/admin.entity';
import { RoleEnum } from '../enums/role.enum';
import { hash } from 'argon2';

@Injectable()
export class AdminService {
  constructor(private readonly dataSourse: DataSource) {}
  async createInitAdmin() {
    await this.dataSourse.transaction(async (manager) => {
      let admin = await manager.findOne(AdminEntity, {
        where: { username: process.env.ADMIN_USERNAME },
      });
      if (!admin) {
        await manager.insert(AdminEntity, {
          role: RoleEnum.SUPERADMIN,
          username: process.env.ADMIN_USERNAME,
          hashPassword: await hash(process.env.ADMIN_PASWORD),
        });
        console.log('created Admin');
        
      }
    });
  }
}
