import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { TokenService } from './token.service';
import { RedisService } from '../redis/redis.service';
import { CheckOtpDto, RefreshTokenDto, SendOtpDto } from './dtos/auth.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Tokens } from './types/payload.type';

describe('AuthService', () => {
  let service: AuthService;

  const mockUserRepository = {
    findOneBy: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
  };
  const mockTokenService = {
    generateJWTTokens: jest.fn(),
    verifyRt: jest.fn(),
  };
  const mockRedisService = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn(),
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
    let SendOtpDto: SendOtpDto = { phone: 'test_phone' };
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
      expect(mockUserRepository.findOneBy).toHaveBeenCalledWith({
        phone: SendOtpDto.phone,
      });
    });
  });
  describe('CreateOtpForUser', () => {
    let phone = 'test_phone';
    it('should throw unauthrized exception if otp code not expired!', async () => {
      mockRedisService.get.mockResolvedValue('12345');
      await expect(service.createOtpForUser(phone)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedisService.get).toHaveBeenCalledWith(`otp:${phone}`);
    });
    it('should create a new otp and store it in redis if otp is expired!', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);
      mockRedisService.set.mockResolvedValue('OK');
      const result = await service.createOtpForUser(phone);
      expect(result).toHaveLength(5);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `otp:${phone}`,
        expect.any(String),
        process.env.OTP_TIME_EXPIRED,
      );
    });
  });
  describe('CheckOtp', () => {
    let checkOtpDto: CheckOtpDto = { phone: 'test_phone', code: '12345' };
    it('should throw unauthorized exception if otp is expiried', async () => {
      mockRedisService.get.mockResolvedValueOnce(null);
      await expect(service.checkOtp(checkOtpDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `otp:${checkOtpDto.phone}`,
      );
    });
    it('should throw unAuthorized exception if otp code is incorrect!', async () => {
      mockRedisService.get.mockResolvedValueOnce('54321');

      await expect(service.checkOtp(checkOtpDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `otp:${checkOtpDto.phone}`,
      );
    });
    it('should return tokens if otp is correct', async () => {
      const tokens: Tokens = {
        access_token: 'access',
        refresh_token: 'refresh',
      };
      mockRedisService.get.mockResolvedValue('12345');
      mockTokenService.generateJWTTokens.mockResolvedValue(tokens);
      const result = await service.checkOtp(checkOtpDto);
      expect(result).toHaveProperty('tokens');
      expect(mockRedisService.get).toHaveBeenCalledWith(
        `otp:${checkOtpDto.phone}`,
      );
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `rt_token:${checkOtpDto.phone}`,
        tokens.refresh_token,
        process.env.REFRESH_TOKEN_TIME_EXPIRED,
      );
    });
  });
  describe('RefreshToken', () => {
    let phone = 'test_phone';
    it('should throw unauthorized exception if refresh token is invalid', async () => {
      let rtDto: RefreshTokenDto = { refresh_token: 'invalid_token' };
      mockTokenService.verifyRt.mockReturnValue({ phone });
      mockRedisService.get.mockResolvedValueOnce(null);
      await expect(service.refreshTokens(rtDto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(mockRedisService.get).toHaveBeenCalledWith(`rt_token:${phone}`);
    });
    it('should return new tokens and update Redis with new refresh token', async () => {
      const rtDto: RefreshTokenDto = { refresh_token: 'validToken' };
      const tokens: Tokens = {
        access_token: 'newAccessToken',
        refresh_token: 'newRefreshToken',
      };
      mockTokenService.verifyRt.mockReturnValue({ phone });
      mockRedisService.get.mockResolvedValueOnce(rtDto.refresh_token);
      mockTokenService.generateJWTTokens.mockResolvedValue(tokens);
      const result = await service.refreshTokens(rtDto);
      expect(result).toEqual(tokens);
      expect(mockRedisService.del).toHaveBeenCalledWith(`rt_token:${phone}`);
      expect(mockRedisService.set).toHaveBeenCalledWith(
        `rt:${phone}`,
        tokens.refresh_token,
        process.env.REFRESH_TOKEN_TIME_EXPIRED,
      );
    });
  });
  describe('GetPayloadUser', () => {
    let phone = 'test_phone';
    it('should throw error if user is not found', async () => {
      mockUserRepository.findOne.mockResolvedValueOnce(null);

      await expect(service.getPaylodUser(phone)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { phone },
        select: {
          id: true,
          username: true,
          fullname: true,
          phone_verify: true,
          created_at: true,
        },
      });
    });
    it('should return user data if user is found', async () => {
     
      jest.spyOn(mockUserRepository, 'findOne').mockResolvedValueOnce(mockUser);

      const result = await service.getPaylodUser(phone);

      expect(result).toEqual(mockUser);
      expect(mockUserRepository.findOne).toHaveBeenCalledWith({
        where: { phone },
        select: {
          id: true,
          username: true,
          fullname: true,
          phone_verify: true,
          created_at: true,
        },
      });
    });
  });
});
