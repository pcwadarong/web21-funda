import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as nodemailer from 'nodemailer';
import { User } from 'src/users/entities';
import { Repository, UpdateResult } from 'typeorm';

import { NotificationService } from './notification.service';

// nodemailer 모킹
jest.mock('nodemailer');

describe('NotificationService', () => {
  let service: NotificationService;
  let userRepository: Repository<User>;
  let jwtService: JwtService;
  let sendMailMock: jest.Mock;

  beforeEach(async () => {
    sendMailMock = jest.fn().mockResolvedValue({ messageId: 'test-id' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({
      sendMail: sendMailMock,
    });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            createQueryBuilder: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'MAIL_USER') return 'test@gmail.com';
              if (key === 'MAIL_PASS') return 'password';
              if (key === 'CLIENT_ORIGIN') return 'http://localhost:3000';
              if (key === 'JWT_UNSUBSCRIBE_SECRET') return 'test-unsubscribe-secret';
              return null;
            }),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn(),
            verify: jest.fn(),
            signAsync: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
    jwtService = module.get<JwtService>(JwtService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('handleStreakRemindBatch', () => {
    it('대상 유저가 있으면 메일을 발송하고 lastRemindEmailSentAt을 업데이트해야 한다', async () => {
      // Given
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        displayName: '테스터',
      } as User;

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      };
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as never);
      jest.spyOn(userRepository, 'update').mockResolvedValue({} as UpdateResult);

      // When
      await service.handleStreakRemindBatch();

      // Then
      expect(sendMailMock).toHaveBeenCalledWith(
        expect.objectContaining({
          to: mockUser.email,
          from: expect.stringContaining('test@gmail.com'),
        }),
      );
      expect(userRepository.update).toHaveBeenCalledWith(
        mockUser.id,
        expect.objectContaining({
          lastRemindEmailSentAt: expect.any(Date),
        }),
      );
    });

    it('대상 유저가 없으면 발송 로직을 수행하지 않아야 한다', async () => {
      // Given
      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([]),
      };
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as never);

      // When
      await service.handleStreakRemindBatch();

      // Then
      expect(sendMailMock).not.toHaveBeenCalled();
    });

    it('sendMail이 실패하면 에러를 로깅하고 에러를 전파하지 않아야 한다', async () => {
      // Given
      const mockUser = {
        id: 1,
        email: 'user@example.com',
        displayName: '테스터',
      } as User;

      const mailError = new Error('Mail sending failed');
      sendMailMock.mockRejectedValueOnce(mailError);

      const queryBuilder = {
        where: jest.fn().mockReturnThis(),
        andWhere: jest.fn().mockReturnThis(),
        getMany: jest.fn().mockResolvedValue([mockUser]),
      };
      jest.spyOn(userRepository, 'createQueryBuilder').mockReturnValue(queryBuilder as never);
      jest.spyOn(userRepository, 'update').mockResolvedValue({} as UpdateResult);

      const loggerErrorSpy = jest.spyOn(Logger.prototype, 'error').mockImplementation();

      // When
      await expect(service.handleStreakRemindBatch()).resolves.not.toThrow();

      // Then
      expect(sendMailMock).toHaveBeenCalled();
      expect(loggerErrorSpy).toHaveBeenCalledWith(
        expect.stringContaining(`Failed to send mail to User(${mockUser.id})`),
      );
      // sendMail 실패 시 userRepository.update는 호출되지 않아야 함
      expect(userRepository.update).not.toHaveBeenCalled();

      loggerErrorSpy.mockRestore();
    });
  });

  describe('unsubscribeUser', () => {
    it('이메일로 유저의 구독을 해지해야 한다', async () => {
      // Given
      const email = 'user@example.com';
      jest.spyOn(userRepository, 'update').mockResolvedValue({} as UpdateResult);

      // When
      await service.unsubscribeUser(email);

      // Then
      expect(userRepository.update).toHaveBeenCalledWith(
        { email },
        expect.objectContaining({
          isEmailSubscribed: false,
        }),
      );
    });
  });

  describe('verifyUnsubscribeToken', () => {
    const token = 'test-token';
    const email = 'user@example.com';
    it('유효한 토큰이면 예외 없이 통과해야 한다', async () => {
      // Given
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        email,
        type: 'unsubscribe',
      } as never);
      // When & Then
      await expect(service.verifyUnsubscribeToken(token, email)).resolves.not.toThrow();
    });
    it('이메일이 일치하지 않으면 UnauthorizedException을 던져야 한다', async () => {
      // Given
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        email: 'other@example.com',
        type: 'unsubscribe',
      } as never);
      // When & Then
      await expect(service.verifyUnsubscribeToken(token, email)).rejects.toThrow('Email mismatch');
    });
    it('토큰 타입이 unsubscribe가 아니면 UnauthorizedException을 던져야 한다', async () => {
      // Given
      jest.spyOn(jwtService, 'verify').mockReturnValue({
        email,
        type: 'access', // wrong type
      } as never);
      // When & Then
      await expect(service.verifyUnsubscribeToken(token, email)).rejects.toThrow(
        'Invalid token type',
      );
    });
    it('만료되었거나 무효한 토큰이면 UnauthorizedException을 던져야 한다', async () => {
      // Given
      jest.spyOn(jwtService, 'verify').mockImplementation(() => {
        throw new Error('invalid token');
      });
      // When & Then
      await expect(service.verifyUnsubscribeToken(token, email)).rejects.toThrow(
        'Invalid or expired token',
      );
    });
  });
});
