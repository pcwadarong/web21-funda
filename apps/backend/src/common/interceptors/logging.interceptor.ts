import { randomUUID } from 'crypto';

import { CallHandler, ExecutionContext, Injectable, Logger, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * 모든 HTTP 요청과 응답을 감시하고 기록하는 인터셉터입니다.
 * 이 인터셉터는 요청의 시작부터 끝까지의 실행 시간 및 상세 정보를 로그로 남깁니다.
 */
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  // NestJS 내장 Logger를 사용하여 클래스 이름(LoggingInterceptor)을 컨텍스트로 지정
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 인터셉터는 HTTP뿐만 아니라 RPC, WebSocket 등에서도 동작하므로 HTTP일 때만 로깅 수행
    if (context.getType() === 'http') return this.logHttpCall(context, next);

    // HTTP가 아닌 경우 로직을 건너뛰고 다음 핸들러로 전달
    return next.handle();
  }

  private logHttpCall(context: ExecutionContext, next: CallHandler): Observable<any> {
    // 1. 요청 객체 추출 및 메타데이터 수집
    const request = context.switchToHttp().getRequest();
    const userAgent = request.get('user-agent') || '';
    const { ip, method, path: url } = request;

    // [중요] Correlation ID 생성: 단일 요청에 대한 시작 로그와 종료 로그를 하나로 묶어주는 고유 키
    const correlationKey = randomUUID();

    // 인증된 사용자 정보가 있을 경우 ID 추출 (추적성 확보)
    const userId = request.user?.userId;

    // 2. 요청 시작 로그 기록 (컨트롤러 진입 전)
    this.logger.log(
      `[${correlationKey}] ${method} ${url} ${userId || 'Guest'} ${userAgent} ${ip}: ${
        context.getClass().name // 실행된 컨트롤러 클래스명
      } ${context.getHandler().name}`, // 실행된 메서드명
    );

    const now = Date.now(); // 성능 측정을 위한 시작 시간 기록

    // 3. 응답 스트림 가로채기 (RxJS 파이프라인)
    return next.handle().pipe(
      /**
       * tap 연산자:
       * 응답 데이터(Observable)를 변경하지 않고 '부수 효과(로깅)'만 수행합니다.
       * 컨트롤러 로직이 성공적으로 완료된 시점에 호출됩니다.
       */
      tap(() => {
        const response = context.switchToHttp().getResponse();
        const { statusCode } = response;
        const contentLength = response.get('content-length');

        // 4. 요청 종료 로그 기록 (응답 전송 직전)
        // 실행 시간(ms)을 계산하여 API 성능 모니터링에 활용
        this.logger.log(
          `[${correlationKey}] ${method} ${url} ${statusCode} ${contentLength || 0}: ${
            Date.now() - now
          }ms`,
        );
      }),
    );
  }
}
