import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
// import { TypeOrmModule } from '@nestjs/typeorm';
// import { createTypeOrmOptions } from './config/typeorm.config';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [`.env.${process.env.NODE_ENV ?? 'local'}`, '.env'],
    }),
    // TODO: db 연결 설정
    // TypeOrmModule.forRootAsync({
    //   inject: [ConfigService],
    //   useFactory: createTypeOrmOptions,
    // }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
