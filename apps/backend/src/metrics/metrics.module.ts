import { Global, Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import {
  makeCounterProvider,
  makeHistogramProvider,
  PrometheusModule,
} from '@willsoto/nestjs-prometheus';
import { MetricsInterceptor } from 'src/common/interceptors/metrics.interceptor';

@Global()
@Module({
  imports: [
    PrometheusModule.register({
      path: '/api/metrics',
      defaultMetrics: {
        enabled: true, // 프로세스 메모리, CPU 등 기본 메트릭 활성화
      },
    }),
  ],
  providers: [
    // HTTP 요청 총량 카운터
    makeCounterProvider({
      name: 'http_requests_total',
      help: 'Total number of HTTP requests labeled by method, path and status.',
      labelNames: ['method', 'path', 'status'],
    }),
    // HTTP 응답 시간 히스토그램
    makeHistogramProvider({
      name: 'http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds labeled by method, path and status.',
      labelNames: ['method', 'path', 'status'],
      buckets: [0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10], // 응답 시간 분포 측정 구간
    }),
    // 인터셉터 전역 등록
    {
      provide: APP_INTERCEPTOR,
      useClass: MetricsInterceptor,
    },
  ],
})
export class MetricsModule {}
