import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus } from '@nestjs/common';
import * as Sentry from '@sentry/nestjs';

import { createErrorResponse } from '../response/api-response';

/**
 * 예외를 공통 실패 응답 구조로 변환한다.
 * 실패 응답 형식을 통일해 클라이언트가 일관되게 처리하도록 만든다.
 */
@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost): void {
    if (host.getType() !== 'http') {
      return;
    }

    const context = host.switchToHttp();
    const response = context.getResponse();
    const statusCode = this.getStatusCode(exception);
    const message = this.getMessage(exception);

    this.reportToSentry(exception, statusCode);
    const errorBody = createErrorResponse(statusCode, message);

    response.status(statusCode).json(errorBody);
  }
  private reportToSentry(exception: unknown, statusCode: number): void {
    // 보통 400번대는 유저의 실수이므로 제외
    // 500번대 이상(Internal Server Error)만 Sentry로 보내기
    if (statusCode >= 500) {
      Sentry.captureException(exception);
    }
  }
  private getStatusCode(exception: unknown): number {
    if (exception instanceof HttpException) {
      return exception.getStatus();
    }

    return HttpStatus.INTERNAL_SERVER_ERROR;
  }

  private getMessage(exception: unknown): string {
    if (exception instanceof HttpException) {
      return this.extractMessageFromException(exception);
    }

    return '서버 오류가 발생했습니다.';
  }

  private extractMessageFromException(exception: HttpException): string {
    const response = exception.getResponse();

    if (typeof response === 'string') {
      return response;
    }

    if (typeof response === 'object' && response !== null) {
      const responseBody = response as { message?: string | string[] };
      const message = responseBody.message;

      if (Array.isArray(message)) {
        return message.join(', ');
      }

      if (typeof message === 'string') {
        return message;
      }
    }

    return '요청 처리 중 오류가 발생했습니다.';
  }
}
