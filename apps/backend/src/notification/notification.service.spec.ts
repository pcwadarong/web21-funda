import { ConfigService } from '@nestjs/config';
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
              return null;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<NotificationService>(NotificationService);
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
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
  });
});
