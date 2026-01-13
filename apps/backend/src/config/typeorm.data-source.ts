import path from 'node:path';

import { config as loadEnv } from 'dotenv';
import { DataSource, type DataSourceOptions } from 'typeorm';

import { SolveLog, UserQuizStatus, UserStepAttempt, UserStepStatus } from '../progress/entities';
import { Report } from '../report/entities/report.entity';
import { Field, Quiz, Step, Unit } from '../roadmap/entities';

const toInt = (value: string | undefined, fallback: number): number => {
  const parsed = value ? Number.parseInt(value, 10) : Number.NaN;
  return Number.isNaN(parsed) ? fallback : parsed;
};

const loadEnvironment = (): void => {
  const environment = process.env.NODE_ENV ?? 'local';
  loadEnv({ path: `.env.${environment}` });
  loadEnv({ path: '.env' });
};

loadEnvironment();

const createDataSourceOptions = (): DataSourceOptions => {
  const isProduction = process.env.NODE_ENV === 'production';
  const migrationExtension = isProduction ? 'js' : 'ts';

  return {
    type: 'mysql',
    host: process.env.DB_HOST ?? 'localhost',
    port: toInt(process.env.DB_PORT, 3306),
    username: process.env.DB_USER ?? 'root',
    password: process.env.DB_PASSWORD ?? '',
    database: process.env.DB_NAME ?? 'app',
    entities: [
      Field,
      Unit,
      Step,
      Quiz,
      UserQuizStatus,
      UserStepStatus,
      UserStepAttempt,
      SolveLog,
      Report,
    ],
    migrations: [path.join(__dirname, '..', 'migrations', `*.${migrationExtension}`)],
    synchronize: false,
    logging: process.env.NODE_ENV !== 'production',
  };
};

export const AppDataSource = new DataSource(createDataSourceOptions());
