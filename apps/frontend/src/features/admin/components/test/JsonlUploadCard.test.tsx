import { ThemeProvider } from '@emotion/react';
import { render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { JsonlUploadCard } from '@/feat/admin/components/JsonlUploadCard';
import { lightTheme } from '@/styles/theme';

describe('JsonlUploadCard', () => {
  it('기본 화면을 렌더링한다', () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <JsonlUploadCard
          title="유닛 학습 개요 업로드"
          description="설명"
          status="대기 중"
          result={null}
          busy={false}
          hasFile={false}
          onFileChange={vi.fn()}
          onSubmit={vi.fn()}
        />
      </ThemeProvider>,
    );

    expect(screen.getByText('유닛 학습 개요 업로드')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: '업로드 실행' })).toBeInTheDocument();
  });
});
