import { css, useTheme } from '@emotion/react';
import { type ChangeEvent, type FormEventHandler, memo, useMemo } from 'react';

import { Button } from '@/comp/Button';
import type { UnitOverviewUploadSummary } from '@/services/adminService';
import type { Theme } from '@/styles/theme';

type UnitOverviewUploadResult = UnitOverviewUploadSummary | { error: string };

interface UnitOverviewUploadContainerProps {
  status: string;
  result: UnitOverviewUploadResult | null;
  busy: boolean;
  hasFile: boolean;
  onFileChange: (hasFile: boolean) => void;
  onSubmit: (files: File[]) => void;
}

export const UnitOverviewUploadContainer = memo(
  ({ status, result, busy, hasFile, onFileChange, onSubmit }: UnitOverviewUploadContainerProps) => {
    const theme = useTheme();

    const prettyResult = useMemo(() => {
      if (!result) return '{}';
      return JSON.stringify(result, null, 2);
    }, [result]);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
      onFileChange(!!e.target.files?.length);
    };

    const handleFormSubmit: FormEventHandler<HTMLFormElement> = event => {
      event.preventDefault();
      const fileInput = event.currentTarget.querySelector<HTMLInputElement>('input[type="file"]');
      const files = fileInput?.files ? Array.from(fileInput.files) : [];
      if (files.length > 0) onSubmit(files);
    };

    return (
      <div css={outerContainerStyle}>
        <div css={cardStyle(theme)}>
          <h1 css={titleStyle(theme)}>유닛 학습 개요 업로드</h1>
          <p css={descriptionStyle(theme)}>
            unit_overview.jsonl 형식의 JSON Lines 파일을 업로드하면 unit_title 기준으로 유닛 개요를
            업데이트합니다. 개요는 마크다운으로 작성할 수 있습니다.
          </p>
          <div css={exampleStyle(theme)}>
            <strong>예시</strong>
            <pre css={examplePreStyle}>
              {'{"unit_title":"HTML","overview":"### 개요\\n- 태그 구조"}'}
            </pre>
          </div>

          <form onSubmit={handleFormSubmit}>
            <label htmlFor="file" css={labelStyle(theme)}>
              JSONL 파일
            </label>
            <input
              id="file"
              name="file"
              type="file"
              accept=".jsonl,.txt,.json"
              onChange={handleFileChange}
              css={fileInputStyle(theme)}
              multiple
            />
            <div css={footerStyle}>
              <Button variant="primary" type="submit" disabled={busy || !hasFile} fullWidth>
                {busy ? '업로드 중...' : '업로드 실행'}
              </Button>
            </div>
          </form>

          <div css={statusBoxStyle(theme)}>
            <span css={statusDot(status)} />
            {status}
          </div>

          <pre css={preStyle(theme)}>{prettyResult}</pre>

          <div css={tipStyle(theme)}>
            <span style={{ marginRight: '6px' }}>💡</span>
            TIP: unit_title이 동일한 유닛이 여러 개면 모두 동일한 개요로 업데이트됩니다.
          </div>
        </div>
      </div>
    );
  },
);

const outerContainerStyle = css`
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 24px;
  min-height: 100vh;
`;

const cardStyle = (theme: Theme) => css`
  width: 100%;
  max-width: 45rem;
  background: ${theme.colors.surface.strong};
  padding: 32px;
  border-radius: ${theme.borderRadius.large};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  color: ${theme.colors.text.strong};
  margin: 0 0 12px;
`;

const descriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.text.default};
  line-height: 1.6;
  margin-bottom: 20px;
`;

const exampleStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.default};
  border-radius: ${theme.borderRadius.medium};
  padding: 12px 16px;
  margin-bottom: 20px;
  color: ${theme.colors.text.default};
  font-size: 14px;
`;

const examplePreStyle = css`
  margin: 8px 0 0;
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
`;

const labelStyle = (theme: Theme) => css`
  display: block;
  margin-bottom: 8px;
  font-weight: 700;
  color: ${theme.colors.text.strong};
`;

const fileInputStyle = (theme: Theme) => css`
  width: 100%;
  padding: 16px;
  border: 1px dashed ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.default};
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: ${theme.colors.primary.main};
  }
`;

const footerStyle = css`
  margin-top: 24px;
  display: flex;
`;

const statusBoxStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  margin-top: 24px;
  padding: 12px 16px;
  background: ${theme.colors.surface.default};
  border-radius: 8px;
  font-weight: 600;
  color: ${theme.colors.text.strong};
`;

const statusDot = (status: string) => css`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 10px;
  background: ${status === '업로드 완료'
    ? '#22c55e'
    : status === '업로드 실패'
      ? '#ef4444'
      : '#eab308'};
`;

const preStyle = (theme: Theme) => css`
  margin-top: 16px;
  padding: 16px;
  background: #1e293b;
  color: #f8fafc;
  border-radius: 8px;
  font-family: monospace;
  font-size: 14px;
  overflow: auto;
  max-height: 360px;
  border: 1px solid ${theme.colors.border.default};
`;

const tipStyle = (theme: Theme) => css`
  margin-top: 16px;
  font-size: 14px;
  color: ${theme.colors.text.weak};
`;
