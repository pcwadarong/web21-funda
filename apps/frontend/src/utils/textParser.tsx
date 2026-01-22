import { css, useTheme } from '@emotion/react';
import React from 'react';

import { inlineCodeStyle } from '@/comp/MarkdownRenderer';
import { useThemeStore } from '@/store/themeStore';
import type { Theme } from '@/styles/theme';
import { colors } from '@/styles/token';

/**
 * 텍스트에서 `...` 또는 <...> 패턴을 찾아 inlineCodeStyle을 적용하는 컴포넌트
 * 텍스트에서 {{BLANK}} 를 찾아서 빈칸 스타일을 적용하는 컴포넌트
 *
 * @param text 파싱할 텍스트
 * @returns ReactNode 배열 (텍스트와 스타일이 적용된 코드 부분)
 *
 * @example
 * <TextWithCodeStyle text="이것은 `코드`입니다" />
 * <TextWithCodeStyle text="이것은 <태그>입니다" />
 * {{BLANK}}를 채우세요
 */
export const TextWithCodeStyle = ({ text }: { text: string }) => {
  const theme = useTheme();
  const { isDarkMode } = useThemeStore();
  // `...` 패턴, <...> 패턴, {{BLANK}} 패턴을 모두 찾는 정규식
  // 백틱: `로 시작해서 `로 끝나는 패턴 (이스케이프된 백틱 제외)
  // 태그: <로 시작해서 >로 끝나는 패턴
  // BLANK: {{BLANK}} 패턴
  const pattern = /(`[^`]+`)|(<[^>]+>)|(\{\{BLANK\}\})/g;

  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  let match;
  let keyIndex = 0;

  while ((match = pattern.exec(text)) !== null) {
    // 빈 매치 방지
    if (match[0].length === 0) continue;

    // 매치 전의 일반 텍스트 추가
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }

    // {{BLANK}} 패턴인 경우
    if (match[3]) {
      // 빈칸 스타일 적용
      parts.push(
        <span key={`blank-${keyIndex++}`} css={blankStyle(theme)}>
          {' '}
        </span>,
      );
    } else {
      // 매치된 코드 부분 (백틱 또는 태그 제거)
      const codeContent = match[0].startsWith('`')
        ? match[0].slice(1, -1) // 백틱 제거
        : match[0].slice(1, -1); // < > 제거

      // 빈 내용 방지
      if (codeContent.length > 0) {
        // 스타일이 적용된 코드 부분 추가
        parts.push(
          <span key={`code-${keyIndex++}`} css={inlineCodeStyle(theme, isDarkMode)}>
            {codeContent}
          </span>,
        );
      }
    }

    lastIndex = pattern.lastIndex;
  }

  // 마지막 매치 이후의 텍스트 추가
  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  // 매치가 없으면 원본 텍스트 반환
  if (parts.length === 0) {
    return <>{text}</>;
  }

  return <>{parts}</>;
};

// BLANK 스타일 (CodeBlock.tsx의 빈칸 스타일과 동일)
const blankStyle = (theme: Theme) => css`
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
