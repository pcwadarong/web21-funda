import { CallHandler, ExecutionContext, Injectable, NestInterceptor } from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { type ApiResponse, createSuccessResponse } from '../response/api-response';

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
        const statusCode = response.statusCode;
        const result = data ?? null;

        return createSuccessResponse(result, statusCode);
      }),
    );
  }
}
