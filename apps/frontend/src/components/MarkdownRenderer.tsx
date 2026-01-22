import type { SerializedStyles } from '@emotion/react';
import { css, useTheme } from '@emotion/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from '@/comp/CodeBlock';
import type { Theme } from '@/styles/theme';

interface MarkdownRendererProps {
  text: string;
  customCss?: SerializedStyles;
}

/**
 * 코드 블록 className에서 언어 정보를 추출한다.
 *
 * @param className 코드 블록 className
 * @returns 언어 문자열 또는 null
 */
const extractLanguage = (className?: string | null): string | null => {
  if (!className) {
    return null;
  }

  const match = className.match(/language-(\w+)/);
  return match && match[1] ? match[1] : null;
};

/**
 * 마크다운 텍스트를 렌더링하는 공통 컴포넌트
 *
 * @param text 마크다운 텍스트
 * @param className 추가 CSS 클래스
 *
 * `@security` rehypeRaw 플러그인으로 raw HTML을 렌더링합니다.
 * 신뢰할 수 없는 사용자 입력은 sanitize 후 전달해야 합니다.
 */
export const MarkdownRenderer = ({ text, customCss }: MarkdownRendererProps) => {
  const theme = useTheme();

  return (
    <div css={[markdownContainerStyle, customCss]}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeRaw]}
        components={{
          p: ({ children }) => <p css={markdownParagraphStyle(theme)}>{children}</p>,
          ul: ({ children }) => <ul css={markdownListStyle(theme)}>{children}</ul>,
          ol: ({ children }) => <ol css={markdownListStyle(theme)}>{children}</ol>,
          li: ({ children }) => <li css={markdownListItemStyle(theme)}>{children}</li>,
          h1: ({ children }) => <h1 css={markdownHeadingStyle(theme, 1)}>{children}</h1>,
          h2: ({ children }) => <h2 css={markdownHeadingStyle(theme, 2)}>{children}</h2>,
          h3: ({ children }) => <h3 css={markdownHeadingStyle(theme, 3)}>{children}</h3>,
          h4: ({ children }) => <h4 css={markdownHeadingStyle(theme, 4)}>{children}</h4>,
          table: ({ children }) => <table css={tableStyle(theme)}>{children}</table>,
          thead: ({ children }) => <thead css={tableHeadStyle(theme)}>{children}</thead>,
          tbody: ({ children }) => <tbody>{children}</tbody>,
          tr: ({ children }) => <tr css={tableRowStyle(theme)}>{children}</tr>,
          th: ({ children }) => <th css={tableCellStyle(theme, true)}>{children}</th>,
          td: ({ children }) => <td css={tableCellStyle(theme, false)}>{children}</td>,
          code: props => {
            const { children, className, ...rest } = props;
            const language = extractLanguage(className);

            if (!className) {
              return (
                <code css={inlineCodeStyle(theme)} {...rest}>
                  {children}
                </code>
              );
            }

            return (
              <CodeBlock language={language ?? undefined}>
                {String(children).replace(/\n$/, '')}
              </CodeBlock>
            );
          },
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
};

const markdownContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const markdownParagraphStyle = (theme: Theme) => css`
  margin: 0;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
`;

const markdownListStyle = (theme: Theme) => css`
  margin: 0;
  padding-left: 20px;
  display: flex;
  flex-direction: column;
  gap: 8px;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
`;

const markdownListItemStyle = (theme: Theme) => css`
  margin: 0;
  color: ${theme.colors.text.default};
`;

const markdownHeadingStyle = (theme: Theme, level: 1 | 2 | 3 | 4) => css`
  font-size: ${level === 1 ? '32px' : level === 2 ? '24px' : level === 3 ? '20px' : '16px'};
  font-weight: 700;
  margin: 0;
  margin-top: ${level === 1 ? '0' : '16px'};
  margin-bottom: 8px;
  color: ${theme.colors.text.strong};
`;

const tableStyle = (theme: Theme) => css`
  width: 100%;
  border-collapse: collapse;
  margin: 12px 0;
  font-size: ${theme.typography['16Medium'].fontSize};
`;

const tableHeadStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
`;

const tableRowStyle = (theme: Theme) => css`
  border-bottom: 1px solid ${theme.colors.border.default};
`;

const tableCellStyle = (theme: Theme, isHeader: boolean) => css`
  padding: 8px 12px;
  text-align: left;
  color: ${isHeader ? theme.colors.text.strong : theme.colors.text.default};
  font-weight: ${isHeader ? 700 : 400};
`;

const inlineCodeStyle = (theme: Theme) => css`
  font-family: 'D2Coding', monospace;
  padding: 2px 5px;
  margin: 0 2px;
  border-radius: 4px;
  background: ${theme.colors.grayscale[200]};
  border: 1px solid ${theme.colors.border.default};
  font-size: 0.85em;
  color: ${theme.colors.primary.main}; /* 텍스트 색상에 포인트를 줌 */
  vertical-align: middle;
`;
