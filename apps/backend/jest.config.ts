import type { Config } from 'jest';

const config: Config = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': ['ts-jest', { tsconfig: 'tsconfig.spec.json' }],
  },
  collectCoverageFrom: ['src/**/*.ts'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  // code-formatter가 Prettier를 import하는데, Prettier가 Jest 환경에서
  // 동적 import를 사용하려고 해서 에러가 발생합니다.
  // 이를 해결하기 위해 code-formatter를 모킹합니다.
  moduleNameMapper: {
    '^../common/utils/code-formatter$': '<rootDir>/src/common/utils/__mocks__/code-formatter.ts',
  },
};

export default config;
