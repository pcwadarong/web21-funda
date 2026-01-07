import { ConfigService } from '@nestjs/config';
import { type DataSourceOptions } from 'typeorm';

import { Field, Quiz, Step, Unit } from '../roadmap/entities';
import { SolveLog, UserQuizStatus, UserStepStatus } from '../progress/entities';

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
};

export const createTypeOrmOptions = (config: ConfigService): DataSourceOptions => ({
  type: 'mysql',
  host: config.get<string>('DB_HOST', 'localhost'),
  port: toInt(config.get<string>('DB_PORT'), 3306),
  username: config.get<string>('DB_USER', 'root'),
  password: config.get<string>('DB_PASSWORD', ''),
  database: config.get<string>('DB_NAME', 'app'),
  entities: [Field, Unit, Step, Quiz, UserQuizStatus, UserStepStatus, SolveLog],
  synchronize: true,
  logging: config.get<string>('NODE_ENV') !== 'production',
});
