import { css, useTheme } from '@emotion/react';
import type { HTMLAttributes } from 'react';
import { useEffect, useRef } from 'react';
// PrismLight를 사용하여 필요한 언어만 전략적으로 등록합니다.
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
// 필요한 언어만 import
import c from 'react-syntax-highlighter/dist/esm/languages/prism/c';
import cpp from 'react-syntax-highlighter/dist/esm/languages/prism/cpp';
import dart from 'react-syntax-highlighter/dist/esm/languages/prism/dart'; // flutter
import java from 'react-syntax-highlighter/dist/esm/languages/prism/java';
import js from 'react-syntax-highlighter/dist/esm/languages/prism/javascript';
import kotlin from 'react-syntax-highlighter/dist/esm/languages/prism/kotlin';
import markup from 'react-syntax-highlighter/dist/esm/languages/prism/markup'; // html/xml
import py from 'react-syntax-highlighter/dist/esm/languages/prism/python';
import ts from 'react-syntax-highlighter/dist/esm/languages/prism/typescript';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

import type { Theme } from '@/styles/theme';
import { colors } from '@/styles/token';

// 언어 등록
SyntaxHighlighter.registerLanguage('javascript', js);
SyntaxHighlighter.registerLanguage('typescript', ts);
SyntaxHighlighter.registerLanguage('python', py);
SyntaxHighlighter.registerLanguage('java', java);
SyntaxHighlighter.registerLanguage('kotlin', kotlin);
SyntaxHighlighter.registerLanguage('dart', dart);
SyntaxHighlighter.registerLanguage('c', c);
SyntaxHighlighter.registerLanguage('cpp', cpp);
SyntaxHighlighter.registerLanguage('html', markup);

export interface CodeBlockProps extends HTMLAttributes<HTMLPreElement> {
  children: string;
  language?: string;
}

const PLACEHOLDER = '___BLANK___';

export const CodeBlock = ({ children, language = 'javascript' }: CodeBlockProps) => {
  const theme = useTheme();
  const containerRef = useRef<HTMLDivElement>(null);

  // {{BLANK}}를 임시 placeholder로 치환
  const codeWithPlaceholder = children.replace(/\{\{BLANK\}\}/g, PLACEHOLDER);

  // 하이라이팅 후 DOM에서 placeholder를 빈칸 요소로 교체
  useEffect(() => {
    if (!containerRef.current) return;

    const walker = document.createTreeWalker(containerRef.current, NodeFilter.SHOW_TEXT, null);

    const nodesToReplace: { node: Text; parts: string[] }[] = [];

    // 모든 텍스트 노드를 순회하며 PLACEHOLDER 찾기
    let node: Node | null;
    while ((node = walker.nextNode())) {
      const textNode = node as Text;
      if (textNode.textContent?.includes(PLACEHOLDER)) {
        const parts = textNode.textContent.split(PLACEHOLDER);
        nodesToReplace.push({ node: textNode, parts });
      }
    }

    // 찾은 텍스트 노드들을 교체
    nodesToReplace.forEach(({ node, parts }) => {
      const parent = node.parentNode;
      if (!parent) return;

      const fragment = document.createDocumentFragment();

      parts.forEach((part, i) => {
        if (part) fragment.appendChild(document.createTextNode(part));

        // 마지막 part가 아니면 빈칸 요소 추가
        if (i < parts.length - 1) {
          const blank = document.createElement('span');
          blank.style.cssText = `
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
          fragment.appendChild(blank);
        }
      });

      parent.replaceChild(fragment, node);
    });
  }, [children, language, theme]);

  return (
    <div css={codeBlockContainerStyle(theme)}>
      <div css={badgeContainerStyle(theme)}>
        <div css={badgeStyle(theme)}>{language}</div>
      </div>
      <div css={preStyle} ref={containerRef}>
        <SyntaxHighlighter
          language={language.toLowerCase()}
          style={vscDarkPlus}
          PreTag="div"
          codeTagProps={{
            style: {
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
            },
          }}
          customStyle={{
            margin: 0,
            padding: 0,
            background: 'transparent',
            fontSize: '14px',
            lineHeight: '1.5',
            fontFamily: "'D2Coding', monospace",
          }}
        >
          {codeWithPlaceholder}
        </SyntaxHighlighter>
      </div>
    </div>
  );
};

const codeBlockContainerStyle = (theme: Theme) => css`
  background: ${colors.light.grayscale[900]};
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  overflow: hidden;
  width: 100%;
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
  padding: 0px 12px;
  border-radius: 20px;
  color: #704508;
  font-size: ${theme.typography['12Medium'].fontSize};
`;

const preStyle = css`
  padding: 20px;
  overflow-x: auto;
  white-space: pre-wrap;
  word-break: break-all;
`;
