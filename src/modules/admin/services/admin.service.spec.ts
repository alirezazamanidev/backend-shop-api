import { Test, TestingModule } from '@nestjs/testing';
import { AdminService } from './admin.service';
import { DataSource, DeepPartial, EntityManager } from 'typeorm';
import { Request } from 'express';
import { REQUEST } from '@nestjs/core';
import { RoleEnum } from '../enums/role.enum';
import { AdminEntity } from '../entities/admin.entity';
import * as argon2 from 'argon2';
import { LoginDto } from '../dtos/admin.dto';
import { ForbiddenException } from '@nestjs/common';

jest.mock('argon2');
jest.mock('express');
describe('AdminService', () => {
  let service: AdminService;
  let mockDataSource: DeepPartial<DataSource>;
  let mockRequest: Partial<Request>;
  let mockSession: any;
  const adminMock = {
    id: 1,
    username: process.env.ADMIN_USERNAME,
    role: RoleEnum.SUPERADMIN,
  };
  const loginDto: LoginDto = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASWORD,
  };

  beforeEach(async () => {
    mockSession = {
      admin: null,
      destroy: jest.fn().mockImplementation((callback) => callback(null)),
    };
    mockRequest = {
      session: mockSession,
    };
    const mockEntityManager = {
      findOne: jest.fn(),
      findOneBy: jest.fn(),
      insert: jest.fn(),
    } as unknown as EntityManager;
    mockDataSource = {
      transaction: jest.fn().mockImplementation(async (callback) => {
        await callback(mockDataSource.manager);
      }),
      manager: mockEntityManager,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AdminService,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
        {
          provide: REQUEST,
          useValue: mockRequest,
        },
      ],
    }).compile();

    service = await module.resolve(AdminService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('CreateInitAdmin', () => {
    it('should create admin if one does not exist', async () => {
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValue(null);

      await service.createInitAdmin();
      expect(mockDataSource.manager.insert).toHaveBeenCalledTimes(1);
      expect(mockDataSource.manager.insert).toHaveBeenCalledWith(
        AdminEntity,
        expect.objectContaining({
          role: RoleEnum.SUPERADMIN,
          username: process.env.ADMIN_USERNAME,
        }),
      );
    });
    it('should not created admin if none alreay exists', async () => {
      (mockDataSource.manager.findOne as jest.Mock).mockResolvedValue(
        adminMock,
      );
      await service.createInitAdmin();
      expect(mockDataSource.manager.insert).not.toHaveBeenCalled();
    });
    it('should handle database transaction failure gracefully', async () => {
      // Simulate a database error during transaction
      (mockDataSource.transaction as jest.Mock).mockRejectedValueOnce(
        new Error('Database transaction failed'),
      );

      await expect(service.createInitAdmin()).rejects.toThrowError(
        'Database transaction failed',
      );
    });
  });
  describe('Login', () => {
    it('should login successfully with valid credentials', async () => {
      const hashPassword = await argon2.hash('testpassword');
      (mockDataSource.manager.findOneBy as jest.Mock).mockResolvedValue({
        ...adminMock,
        hashPassword,
      });
      (argon2.verify as jest.Mock).mockResolvedValue(true);
      const result = await service.login(loginDto);

      expect(result).toEqual({ message: 'loggedIn successFully' });
      expect(mockRequest.session.admin).toEqual({
        id: adminMock.id,
        role: adminMock.role,
      });
    });
    it('should throw ForbiddenException if username or password is invalid', async () => {
      // Simulate an invalid admin (no matching username)
      (mockDataSource.manager.findOneBy as jest.Mock).mockResolvedValueOnce(
        null,
      );

      await expect(service.login(loginDto)).rejects.toThrow(
        new ForbiddenException('username or password is not valid!'),
      );
    });
  
  });
});
