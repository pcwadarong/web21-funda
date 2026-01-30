import type { SerializedStyles } from '@emotion/react';
import { css, useTheme } from '@emotion/react';
import ReactMarkdown from 'react-markdown';
import rehypeRaw from 'rehype-raw';
import rehypeSanitize, { defaultSchema } from 'rehype-sanitize';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from '@/comp/CodeBlock';
import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/styles/theme';

interface MarkdownRendererProps {
  text: string;
  customCss?: SerializedStyles;
  allowHtml?: boolean;
}

/**
 * 코드 블록 className에서 언어 정보를 추출한다.
 *
 * @param className 코드 블록 className
 * @returns 언어 문자열 또는 null
 */
const extractLanguage = (className?: string | null): string | null => {
  if (!className) return null;
  const match = className.match(/language-(\w+)/);
  return match && match[1] ? match[1] : null;
};

/**
 * 마크다운 텍스트를 렌더링하는 공통 컴포넌트
 *
 * @param text 마크다운 텍스트
 * @param customCss 추가 CSS 클래스
 *
 * `@security` rehypeRaw 플러그인으로 raw HTML을 렌더링합니다.
 * 신뢰할 수 없는 사용자 입력은 sanitize 후 전달해야 합니다.
 */
export const MarkdownRenderer = ({ text, customCss, allowHtml = true }: MarkdownRendererProps) => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();

  return (
    <div css={[markdownContainerStyle(theme), customCss]}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={allowHtml ? [rehypeRaw, [rehypeSanitize, defaultSchema]] : []}
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
                <code css={inlineCodeStyle(theme, isDarkMode)} {...rest}>
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

const markdownContainerStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 16px;

  /* 중첩 ul */
  & ul ul li {
    list-style-type: circle !important;
    margin: 8px 0 0 0;
  }

  /* 중첩 ol */
  & ol ol li {
    list-style-type: lower-alpha !important;
    margin: 8px 0 0 0;
  }

  /* ul 안의 ol, ol 안의 ul 등 */
  & ul ol li {
    list-style-type: decimal !important;
    margin: 8px 0 0 0;
  }

  & ol ul li {
    list-style-type: disc !important;
    margin: 8px 0 0 0;
  }

  & blockquote {
    margin: 0px 0px 0.5rem 0px;
    position: relative;
    padding: 40px 55px 40px;
    background: ${theme.colors.grayscale['100']};
    border-radius: 16px;
  }

  & blockquote:after {
    content: '\\201C';
    font-size: 76px;
    position: absolute;
    top: 5px;
    left: 15px;
    color: ${theme.colors.primary.light};
    font-family: georgia;
  }

  & blockquote:before {
    content: '\u2014 Fundy';
    font-size: 16px;
    position: absolute;
    bottom: 20px;
    left: 55px;
    font-family: georgia;
    font-style: italic;
    color: ${theme.colors.text.weak};
  }

  & blockquote p {
    max-width: 100%;
    padding: 0;
    margin: 0 0 15px;
    font-size: 20px;
    line-height: 32px;
    word-break: keep-all;
    color: ${theme.colors.text.default};
  }
`;

const markdownParagraphStyle = (theme: Theme) => css`
  margin: 0;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
`;

const markdownListStyle = (theme: Theme) => css`
  margin: 0;
  padding-left: 32px;
  list-style-type: disc !important;
  list-style-position: outside !important;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
`;

const markdownListItemStyle = (theme: Theme) => css`
  display: list-item !important;
  list-style-type: disc !important;
  margin: 0 0 8px;
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

export const inlineCodeStyle = (theme: Theme, isDarkMode: boolean) => css`
  font-family: 'D2Coding', monospace;
  padding: 2px 5px;
  margin: 0 2px;
  border-radius: 4px;
  background: ${theme.colors.surface.bold};
  border: 1px solid ${theme.colors.border.default};
  font-size: 0.85em;
  color: ${isDarkMode ? theme.colors.primary.light : theme.colors.primary.main};
  vertical-align: middle;
`;
