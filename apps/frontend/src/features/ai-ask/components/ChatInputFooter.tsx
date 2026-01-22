import { css, useTheme } from '@emotion/react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import type { Theme } from '@/styles/theme';

interface ChatInputFooterProps {
  input: string;
  onInputChange: (value: string) => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  isStreaming: boolean;
  maxQuestionLength: number;
}

export const ChatInputFooter = ({
  input,
  onInputChange,
  onSubmit,
  isStreaming,
  maxQuestionLength,
}: ChatInputFooterProps) => {
  const theme = useTheme();

  return (
    <footer css={footerStyle(theme)}>
      <form css={inputBarStyle} onSubmit={onSubmit}>
        <input
          css={inputStyle(theme)}
          value={input}
          onChange={event => onInputChange(event.target.value)}
          placeholder="궁금한 것을 질문해보세요."
          maxLength={maxQuestionLength}
          disabled={isStreaming}
        />
        <Button
          type="submit"
          variant="primary"
          css={sendButtonStyle(theme)}
          aria-label="질문 전송"
          disabled={isStreaming || input.trim().length === 0}
        >
          <SVGIcon icon="Send" size="sm" />
        </Button>
      </form>
      <span css={captionStyle(theme)}>
        AI는 실수를 할 수 있습니다. 중요한 정보는 확인이 필요합니다.
      </span>
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

const captionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  text-align: center;
`;
