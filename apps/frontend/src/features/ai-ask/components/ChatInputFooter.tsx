import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import type { Theme } from '@/styles/theme';

import type { ChatInputFooterProps } from './types';

/**
 * 채팅 입력 푸터 컴포넌트 Props
 */

/**
 * AI 질문 입력 폼과 안내 문구를 포함하는 푸터 컴포넌트
 *
 * @description
 * - 질문 입력 필드와 전송 버튼 제공
 * - 스트리밍 중일 때 입력 비활성화
 * - AI 답변의 신뢰성에 대한 안내 문구 표시
 *
 * @param props - 컴포넌트 props
 * @returns 채팅 입력 푸터 JSX 요소
 */
export const ChatInputFooter = ({
  input,
  onInputChange,
  onSubmit,
  isStreaming,
  maxQuestionLength,
}: ChatInputFooterProps) => {
  const theme = useTheme();

  const remainingChars = maxQuestionLength - input.length;
  const isDisabled = isStreaming || input.trim().length === 0;

  return (
    <footer css={footerStyle(theme)} aria-label="질문 입력">
      <form css={inputBarStyle} onSubmit={onSubmit} aria-label="AI 질문 입력 폼" noValidate>
        <label htmlFor="ai-question-input" css={srOnlyStyle}>
          AI에게 질문하기
        </label>
        <input
          id="ai-question-input"
          css={inputStyle(theme)}
          value={input}
          onChange={event => onInputChange(event.target.value)}
          placeholder="궁금한 것을 질문해보세요."
          maxLength={maxQuestionLength}
          disabled={isStreaming}
          aria-label="질문 입력"
          aria-describedby="question-help-text question-char-count"
          aria-invalid={false}
          autoComplete="off"
        />
        <Button
          type="submit"
          variant="primary"
          css={sendButtonStyle(theme)}
          aria-label={isStreaming ? '답변 생성 중' : '질문 전송'}
          disabled={isDisabled}
          aria-disabled={isDisabled}
        >
          <SVGIcon icon="Send" size="sm" aria-hidden="true" />
        </Button>
      </form>
      <div css={helperTextStyle}>
        <span id="question-char-count" css={charCountStyle(theme)} aria-live="polite">
          {remainingChars}자 남음
        </span>
        <span id="question-help-text" css={captionStyle(theme)}>
          AI는 실수를 할 수 있습니다. 중요한 정보는 확인이 필요합니다.
        </span>
      </div>
    </footer>
  );
};

const footerStyle = (theme: Theme) => css`
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 100;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: ${theme.colors.surface.strong};
  box-shadow: 0 -10px 20px rgba(0, 0, 0, 0.05);
  border-top: 1px solid ${theme.colors.border.default};
  padding: 16px 24px;
`;

const inputBarStyle = css`
  display: flex;
  gap: 8px;
  align-items: center;
  position: sticky;
  bottom: 0;

  padding-top: 8px;
`;

const inputStyle = (theme: Theme) => css`
  flex: 1;
  height: 44px;
  border-radius: 999px;
  border: 1px solid ${theme.colors.border.default};

  padding: 0 16px;
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.text.default};
`;

const sendButtonStyle = (theme: Theme) => css`
  width: 44px;
  height: 44px;
  padding: 0;
  border-radius: 999px;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${theme.colors.primary.main};

  &:hover,
  &:active {
    filter: brightness(1.5);
    box-shadow: none;
  }
`;

const srOnlyStyle = css`
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border-width: 0;
`;

const helperTextStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
`;

const charCountStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const captionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  text-align: center;
`;
