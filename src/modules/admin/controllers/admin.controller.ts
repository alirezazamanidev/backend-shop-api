import {
  Body,
  Controller,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  OnModuleInit,
  Post,
  Req,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminService } from '../services/admin.service';
import { ApiConsumes, ApiHeaders, ApiOperation } from '@nestjs/swagger';
import { LoginDto } from '../dtos/admin.dto';
import { ContentType } from 'src/common/enums';
import { Request, Response } from 'express';
import { generateToken } from 'src/configs';

@Controller('admin')
export class AdminController implements OnModuleInit {
  constructor(private readonly adminService: AdminService) {}

  async onModuleInit() {
    await this.adminService.createInitAdmin();
  }

  @ApiOperation({ summary: 'login to admin account' })
  @HttpCode(HttpStatus.OK)
  @Post('login')
  @ApiHeaders([
    {
      name: 'X-XSRF-TOKEN',
      description: 'CSRF token',
      required: true,
      
    },
  ])
  @ApiConsumes(ContentType.URL_ENCODED, ContentType.JSON)
  login(@Body() adminDto: LoginDto) {

    return this.adminService.login(adminDto);
  }

  @Get('info')
  async getInfo(@Req() req: Request) {
    if (!req.session?.admin) {
      throw new ForbiddenException('You are not logged in');
    }
    return req.session.admin;
  }
}
