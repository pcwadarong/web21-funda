import { Injectable, Logger } from '@nestjs/common';
import * as prettier from 'prettier';

@Injectable()
export class CodeFormatter {
  // NestJS 내장 Logger 인스턴스 생성
  private readonly logger = new Logger(CodeFormatter.name);
  private readonly safeTag = 'quizblank';
  private readonly BLANK_PATTERN = /{{BLANK}}/g;
  private readonly HOLDER_PREFIX = new RegExp(this.safeTag, 'g');
  private readonly supportedParsers: Record<string, string> = {
    javascript: 'babel',
    typescript: 'babel-ts',
    html: 'html',
    css: 'css',
    json: 'json',
  };

  /**
   * 코드를 정렬하여 반환합니다.
   * @param code 원본 코드 문자열
   * @param language 프로그래밍 언어 (html, javascript 등)
   */
  async format(code: string, language: string): Promise<string> {
    const normalizedLanguage = this.normalizeLanguage(language);
    if (!this.isSupportedLanguage(normalizedLanguage)) {
      // 지원하지 않는 언어는 포맷팅을 시도하지 않고 원문을 반환한다
      this.logger.warn(`Unsupported language: ${language}`);
      return code;
    }

    try {
      // 1. 치환: {{BLANK}}를 Prettier가 이해할 수 있는 임시 변수명으로 변경
      const substituted = code.replace(this.BLANK_PATTERN, this.safeTag);

      // 2. 정렬: Prettier 실행
      const formatted = await prettier.format(substituted, {
        parser: this.getParser(normalizedLanguage),
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
    const parser = this.supportedParsers[language];
    if (!parser) {
      throw new Error(`Unsupported language: ${language}`);
    }

    return parser;
  }

  /**
   * 언어 입력값을 표준화한다.
   *
   * @param language 입력된 언어 문자열
   * @returns 공백과 대소문자를 정리한 언어 문자열
   */
  private normalizeLanguage(language: string): string {
    return language.trim().toLowerCase();
  }

  /**
   * Prettier로 포맷팅 가능한 언어인지 확인한다.
   *
   * @param language 표준화된 언어 문자열
   * @returns 지원하면 true, 아니면 false
   */
  private isSupportedLanguage(language: string): boolean {
    if (!language) {
      return false;
    }

    return Boolean(this.supportedParsers[language]);
  }
}
