import { ForbiddenException, Inject, Injectable, Scope } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { AdminEntity } from '../entities/admin.entity';
import { RoleEnum } from '../enums/role.enum';
import { hash, verify } from 'argon2';
import { LoginDto } from '../dtos/admin.dto';
import { REQUEST } from '@nestjs/core';
import { Request } from 'express';


@Injectable({ scope: Scope.REQUEST })
export class AdminService {
  constructor(
    private readonly dataSourse: DataSource,
    @Inject(REQUEST) private readonly request: Request,

  ) {}
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

  async login(dto: LoginDto) {
    let { password, username } = dto;
    const admin = await this.dataSourse.manager.findOneBy(AdminEntity, {
      username,
    });
    if (!admin || !(await verify( admin.hashPassword,password)))
      throw new ForbiddenException('username or password is not valid!');


    
    if (this.request.session?.admin) {
      await new Promise((resolve, reject) => {
        this.request.session.destroy((err) => {
          if (err) {
            reject(err);
          } else {
            resolve('Session destroyed');
          }
        });
      });
    }
    this.request.session.admin = { id: admin.id, role: admin.role }
    return {
      message: 'loggedIn successFully',
    };
  }
}
