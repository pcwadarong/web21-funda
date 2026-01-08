import { css, useTheme } from '@emotion/react';
import type { HTMLAttributes } from 'react';

import type { Theme } from '@/styles/theme';
import { colors } from '@/styles/token';

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  children: React.ReactNode;
  language?: string;
}

export const CodeBlock = ({ children, language = 'JavaScript' }: CodeBlockProps) => {
  const theme = useTheme();

  // 백엔드에서 받은 데이터의 엔터를 구분하여 처리
  const formatCode = (content: React.ReactNode): React.ReactNode => {
    if (typeof content !== 'string') return content;

    const lines = content.split('\n');

    const formattedLines = lines.map((line, index) => {
      const parts = line.trim().split(/({{BLANK}})/g);
      const lineContent = parts.map((part, pIdx) => {
        // {{BLANK}} 패턴을 만나면 회색 박스(BlankBox) 반환
        if (part === '{{BLANK}}')
          return <span key={`blank-${index}-${pIdx}`} css={blankBoxStyle(theme)} />;
        return part;
      });

      // 일반 텍스트인 경우 엔터(\n)를 <br>로 변환
      return (
        <div key={index} style={{ minHeight: '1.5em' }}>
          {lineContent}
        </div>
      );
    });

    return formattedLines;
  };

  return (
    <div css={codeBlockContainerStyle(theme)}>
      <div css={badgeContainerStyle(theme)}>
        <div css={badgeStyle(theme)}>{language}</div>
      </div>
      <pre css={preStyle}>
        <code css={codeStyle(theme)}>{formatCode(children)}</code>
      </pre>
    </div>
  );
};

const codeBlockContainerStyle = (theme: Theme) => css`
  background: ${colors.light.grayscale[900]};
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  overflow: hidden;
`;

const badgeContainerStyle = (theme: Theme) => css`
  background: ${colors.light.grayscale[800]};
  border-bottom: 1px solid ${theme.colors.text.light};
  display: flex;
  justify-content: flex-end;
  align-items: center;
  padding: 8px 12px;
`;

const badgeStyle = (theme: Theme) => css`
  background: #fff9c4;
  padding: 4px 12px;
  border-radius: 20px;
  color: #704508;
  font-size: ${theme.typography['12Medium'].fontSize};
`;

const preStyle = css`
  margin: 0;
  padding: 20px;
  overflow-x: auto;
`;

const codeStyle = (theme: Theme) => css`
  font-family: 'D2Coding', 'Courier New', monospace;
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: 1.6;
  color: ${colors.light.grayscale[50]};
  white-space: pre-wrap;
  word-wrap: break-word;
`;

const blankBoxStyle = (theme: Theme) => css`
  display: inline-block;
  width: 80px;
  height: 1.5em;
  background-color: ${colors.light.grayscale[600]};
  border-radius: ${theme.borderRadius.xsmall};
  vertical-align: middle;
  margin: 0 4px;
  cursor: none;
  user-select: none;
`;
