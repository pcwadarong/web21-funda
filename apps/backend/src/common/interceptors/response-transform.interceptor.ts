import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { type ApiResponse, createSuccessResponse } from '../response/api-response';

interface ResponsePayload<T> {
  result: T | null;
  message?: string;
}

/**
 * 컨트롤러 응답을 공통 성공 응답 구조로 감싼다.
 */
@Injectable()
export class ResponseTransformInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<unknown>> {
    if (context.getType() !== 'http') {
      return next.handle();
    }

    return next.handle().pipe(
      map(data => {
        const response = context.switchToHttp().getResponse();

        // 이미 응답이 전송된 경우(예: redirect)에는 추가 가공 없이 바로 반환한다.
        if (response.headersSent) {
          return data ?? null;
        }

        const statusCode = response.statusCode;
        const payload = this.toPayload(data);
        const successResponse = createSuccessResponse(payload.result, statusCode);

        if (payload.message) {
          return {
            ...successResponse,
            message: payload.message,
          };
        }

        return successResponse;
      }),
    );
  }

  private toPayload<T>(data: T | ResponsePayload<T>): ResponsePayload<T> {
    if (this.isResponsePayload(data)) {
      return data;
    }

    return {
      result: data ?? null,
    };
  }

  private isResponsePayload<T>(data: T | ResponsePayload<T>): data is ResponsePayload<T> {
    if (!data || typeof data !== 'object') {
      return false;
    }

    return 'result' in data;
  }
}
