import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import type { Request, Response } from 'express';
import { Counter, Histogram } from 'prom-client';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class MetricsInterceptor<T> implements NestInterceptor<T, T> {
  constructor(
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler<T>): Observable<T> {
    const http = context.switchToHttp();
    const request = http.getRequest<Request>();
    const response = http.getResponse<Response>();

    // 메트릭 수집 경로 자체는 기록에서 제외
    if (request.path.includes('/metrics')) return next.handle();

    const start = process.hrtime.bigint();
    const method = request.method;

    // 실제 경로 대신 라우트 패턴 추출
    const path = request.route?.path || request.path;

    return next.handle().pipe(
      tap(() => {
        const statusCode = response.statusCode.toString();
        this.logMetrics(method, path, statusCode, start);
      }),
      catchError(err => {
        // 에러 발생 시에도 상태 코드를 기록
        const statusCode = err.status?.toString() || '500';
        this.logMetrics(method, path, statusCode, start);
        return throwError(() => err);
      }),
    );
  }

  private logMetrics(method: string, path: string, status: string, start: bigint) {
    const labels = { method, path, status };

    // 요청 횟수 증가
    this.httpRequestsTotal.labels(labels).inc();

    // 응답 시간 측정 (나노초 -> 초 단위 변환)
    const end = process.hrtime.bigint();
    const duration = Number(end - start) / 1e9;
    this.httpRequestDuration.labels(labels).observe(duration);
  }
}
