import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { TokenService } from './token.service';
import { RedisService } from '../redis/redis.service';
import { SendOtpDto } from './dtos/auth.dto';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockTokenService = {};
  const mockRedisService = {
    get: jest.fn(),
  };
  const mockUser: Partial<UserEntity> = {
    id: 1,
    phone: '09914275883',
  };
  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: mockUserRepository,
        },
        {
          provide: TokenService,
          useValue: mockTokenService,
        },
        {
          provide: RedisService,
          useValue: mockRedisService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('SendOtp', () => {
    let SendOtpDto: SendOtpDto = { phone: '09914275883' };
    it('should create a new user and send OTP if user does not exist', async () => {
      mockUserRepository.findOneBy.mockResolvedValueOnce(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);
      jest.spyOn(service, 'createOtpForUser').mockResolvedValue('12345');
      const result = await service.sendOtp(SendOtpDto);
      expect(result).toHaveProperty('code');

      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        phone: SendOtpDto.phone,
      });
      expect(mockUserRepository.create).toHaveBeenCalledWith({
        phone: SendOtpDto.phone,
      });
      expect(mockUserRepository.save).toHaveBeenCalledWith(mockUser);
    });
    it('should send otp code an exsiting user', async () => {
      mockUserRepository.findOneBy.mockResolvedValueOnce(mockUser);
      jest.spyOn(service, 'createOtpForUser').mockResolvedValue('1234');
      const result = await service.sendOtp(SendOtpDto);
      expect(result).toHaveProperty('code');
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({ phone: SendOtpDto.phone });
 
    });
  });
});
