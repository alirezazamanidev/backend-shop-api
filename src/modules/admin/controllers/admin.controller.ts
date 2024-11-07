import { Controller, OnModuleInit } from '@nestjs/common';
import { AdminService } from '../services/admin.service';

@Controller('admin')
export class AdminController implements OnModuleInit {
  constructor(private readonly adminService: AdminService) {}


  async onModuleInit() {
    await this.adminService.createInitAdmin();
  }
}
