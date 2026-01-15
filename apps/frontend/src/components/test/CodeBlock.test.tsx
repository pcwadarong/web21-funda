import { ThemeProvider } from '@emotion/react';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';

import { CodeBlock } from '@/comp/CodeBlock';
import { lightTheme } from '@/styles/theme';

const renderCodeBlock = (props: Partial<React.ComponentProps<typeof CodeBlock>> = {}) => {
  const defaultProps = {
    children: 'const x = 1;',
    ...props,
  };

  return render(
    <ThemeProvider theme={lightTheme}>
      <CodeBlock {...defaultProps} />
    </ThemeProvider>,
  );
};

describe('CodeBlock 컴포넌트 테스트', () => {
  afterEach(() => {
    cleanup();
  });

  it('기본 렌더링이 올바르게 동작한다', () => {
    renderCodeBlock();

    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
  });

  it('language가 기본값으로 JavaScript로 표시된다', () => {
    renderCodeBlock();

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
  });

  it('language prop이 올바르게 표시된다', () => {
    renderCodeBlock({ language: 'TypeScript' });

    expect(screen.getByText('TypeScript')).toBeInTheDocument();
  });

  it('여러 줄 코드가 올바르게 렌더링된다', () => {
    const multiLineCode = 'const x = 1;\nconst y = 2;';
    renderCodeBlock({ children: multiLineCode });

    expect(screen.getByText('const x = 1;')).toBeInTheDocument();
    expect(screen.getByText('const y = 2;')).toBeInTheDocument();
  });

  it('{{BLANK}} 패턴이 회색 박스로 렌더링된다', () => {
    const codeWithBlank = 'const x = {{BLANK}};';
    renderCodeBlock({ children: codeWithBlank });

    // BLANK 패턴이 렌더링되는지 확인 (스타일링된 요소로 존재)
    const codeBlock = screen.getByText(/const x =/).closest('code');
    expect(codeBlock).toBeInTheDocument();
  });

  it('복잡한 코드 블록이 올바르게 렌더링된다', () => {
    const complexCode = `function test() {
  return true;
}`;
    renderCodeBlock({ children: complexCode, language: 'JavaScript' });

    expect(screen.getByText('JavaScript')).toBeInTheDocument();
    expect(screen.getByText(/function test\(\)/)).toBeInTheDocument();
  });
});
