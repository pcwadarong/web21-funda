import { Injectable, Logger } from '@nestjs/common';
import * as prettier from 'prettier';

@Injectable()
export class CodeFormatter {
  // NestJS 내장 Logger 인스턴스 생성
  private readonly logger = new Logger(CodeFormatter.name);
  private readonly safeTag = 'quizblank';
  private readonly BLANK_PATTERN = /{{BLANK}}/g;
  private readonly HOLDER_PREFIX = new RegExp(this.safeTag, 'g');

  /**
   * 코드를 정렬하여 반환합니다.
   * @param code 원본 코드 문자열
   * @param language 프로그래밍 언어 (html, javascript 등)
   */
  async format(code: string, language: string): Promise<string> {
    try {
      // 1. 치환: {{BLANK}}를 Prettier가 이해할 수 있는 임시 변수명으로 변경
      const substituted = code.replace(this.BLANK_PATTERN, this.safeTag);

      // 2. 정렬: Prettier 실행
      const formatted = await prettier.format(substituted, {
        parser: this.getParser(language),
        semi: true,
        singleQuote: true,
        tabWidth: 2,
      });

      // 3. 복구: 임시 변수명을 다시 {{BLANK}}로 변경
      return formatted.replace(this.HOLDER_PREFIX, '{{BLANK}}').trim();
    } catch (error) {
      if (error instanceof Error) this.logger.error(`Formatting failed: ${error.message}`);
      else this.logger.error('An unknown error occurred');

      return code;
    }
  }

  private getParser(language: string): string {
    const map: Record<string, string> = {
      javascript: 'babel',
      typescript: 'babel-ts',
      html: 'html',
      css: 'css',
      json: 'json',
    };
    return map[language.toLowerCase()] || 'babel';
  }
}
