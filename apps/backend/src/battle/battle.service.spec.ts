import { BattleService } from './battle.service';

describe('BattleService', () => {
  it('createBattleQuizSet은 MATCHING 타입을 제외하는 조건을 추가한다.', async () => {
    const selectMock = jest.fn().mockReturnThis();
    const innerJoinMock = jest.fn().mockReturnThis();
    const whereMock = jest.fn().mockReturnThis();
    const andWhereMock = jest.fn().mockReturnThis();
    const getRawManyMock = jest.fn().mockResolvedValue([{ id: 1 }, { id: 2 }, { id: 3 }]);

    const createQueryBuilderMock = jest.fn().mockReturnValue({
      select: selectMock,
      innerJoin: innerJoinMock,
      where: whereMock,
      andWhere: andWhereMock,
      getRawMany: getRawManyMock,
    });

    const quizRepository = {
      createQueryBuilder: createQueryBuilderMock,
    };

    const service = new BattleService(
      {
        getRoom: jest.fn(),
        setRoom: jest.fn(),
        deleteRoom: jest.fn(),
        getAllRooms: jest.fn(),
      } as any,
      quizRepository as any,
      {} as any,
      {} as any,
      {} as any,
    );

    (service as any).shuffleArray = (items: number[]) => items;

    const result = await service.createBattleQuizSet('fe', 2);

    expect(result).toEqual([1, 2]);
    expect(andWhereMock).toHaveBeenCalledWith(
      '(quiz.type IS NULL OR UPPER(quiz.type) != :matchingType)',
      { matchingType: 'MATCHING' },
    );
  });
});
