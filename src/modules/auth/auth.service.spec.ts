import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { UserEntity } from '../user/entities/user.entity';
import { TokenService } from './token.service';
import { RedisService } from '../redis/redis.service';
import { CheckOtpDto, RefreshTokenDto, SendOtpDto } from './dtos/auth.dto';
import { NotFoundException, UnauthorizedException } from '@nestjs/common';
import { Tokens } from './types/payload.type';
import { DataSource, EntityManager } from 'typeorm';
import { randomUUID } from 'crypto';
describe('AuthService', () => {
  let service: AuthService;

  const mockEntityManager = {
    findOneBy: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    findOne: jest.fn(),
  };
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
  const mockDataSource = {
    transaction: jest.fn().mockImplementation((cb) => cb(mockEntityManager)),
  };
  const mockUser: Partial<UserEntity> = {
    id: 1,
    phone: 'phone_Test',
    invite_code: 'invite_code_test',
  };
  const mockReferrer: Partial<UserEntity> = {
    id: 2,
    phone: 'referrer_phone',
    invite_code: 'referrer_code',
    referrerId: null,
    referrer: null,
    invitedUsers: [],
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
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
  describe('SendOtp', () => {
    let SendOtpDto: SendOtpDto = { phone: 'test_phone', referrer_code: '' };

    it('should create a new user and send OTP if user does not exist', async () => {
      mockEntityManager.findOneBy.mockResolvedValueOnce(null); // no user found

      mockEntityManager.create.mockReturnValue(mockUser); // create mock user
      mockEntityManager.save.mockResolvedValue(mockUser); // save user

      jest.spyOn(service, 'createOtpForUser').mockResolvedValue('12345'); // mock OTP generation
      const result = await service.sendOtp(SendOtpDto);

      expect(result.code).toBe('12345'); // check OTP

      expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(UserEntity, {
        phone: SendOtpDto.phone,
      });
      expect(mockEntityManager.create).toHaveBeenCalledWith(UserEntity, {
        phone: SendOtpDto.phone,
        invite_code: expect.any(String),
      });
      // expect(mockEntityManager.save).toHaveBeenCalledWith(mockUser);
    });
    it('should send otp code for an existing user', async () => {
      mockEntityManager.findOneBy.mockResolvedValueOnce(mockUser); // user found
      jest.spyOn(service, 'createOtpForUser').mockResolvedValue('12345'); // mock OTP generation

      const result = await service.sendOtp(SendOtpDto);

      expect(result).toHaveProperty('code');
      expect(result.code).toBe('12345');
      expect(service.createOtpForUser).toHaveBeenCalledWith(SendOtpDto.phone);
      expect(mockEntityManager.findOneBy).toHaveBeenCalledWith(UserEntity, {
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

  describe('setReferrerUser', () => {
    let sendOtpDto: SendOtpDto = {
      phone: 'test_phone',
      referrer_code: 'test_code',
    };
    it('should set referrer for user if referrer code is valid', async () => {
      // Mock behavior for a valid referrer code
      mockEntityManager.findOne.mockResolvedValueOnce(mockReferrer);
      mockEntityManager.save.mockResolvedValueOnce(mockUser);

      // Call the setReferrerUser method
      await service.setReferrerUser('referrer_code', mockUser as UserEntity, mockEntityManager as any);

      // Check that referrer is set correctly for the user
      expect(mockEntityManager.findOne).toHaveBeenCalledWith(UserEntity, {
        where: { invite_code: 'referrer_code' },
        relations: { invitedUsers: true, referrer: true },
      });
      expect(mockEntityManager.save).toHaveBeenCalledWith(UserEntity, mockUser);
      expect(mockReferrer.invitedUsers).toContain(mockUser);
      expect(mockUser.referrerId).toBe(mockReferrer.id);
    });
    it('should throw not found  exception if referrer not founded', async () => {
      mockEntityManager.findOne.mockResolvedValueOnce(null);
      await expect(
        service.setReferrerUser(
          'invalid_referrer_code',
          mockUser as UserEntity,
          mockEntityManager as any,
        ),
      ).rejects.toThrow(new NotFoundException('referrer_code not founded!'));
    });
  });
});
