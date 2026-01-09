import { css, useTheme } from '@emotion/react';
import { type ChangeEvent, useMemo, useState } from 'react';

import { Button } from '@/comp/Button';
import { adminService, type UploadResponse } from '@/services/adminService';
import type { Theme } from '@/styles/theme';

export function AdminQuizUpload() {
  const theme = useTheme();
  const [status, setStatus] = useState('대기 중');
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const prettyResult = useMemo(() => {
    if (!result) return '{}';
    return JSON.stringify(result, null, 2);
  }, [result]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    setHasFile(!!e.target.files?.length);
  };

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.item(0);

    if (!file) return;

    setBusy(true);
    setStatus('업로드 중...');
    setResult(null);

    try {
      const parsed = await adminService.uploadQuizzes(file);
      setStatus('업로드 완료');
      setResult(parsed);
    } catch (error) {
      setStatus('업로드 실패');
      setResult({ error: (error as Error).message });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div css={outerContainerStyle}>
      <div css={cardStyle(theme)}>
        <h1 css={titleStyle(theme)}>JSONL 퀴즈 업로드</h1>
        <p css={descriptionStyle(theme)}>
          quizzes.jsonl 형식의 JSON Lines 파일을 업로드하면 필드 → 유닛 → 스텝 → 퀴즈 순으로
          업서트합니다. order_index가 없으면 자동으로 부모 레코드 개수 + 1을 사용합니다.
        </p>

        <form onSubmit={handleSubmit}>
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
          TIP: 잘못된 JSON 라인이 있으면 에러 메시지에 라인 번호가 표시됩니다.
        </div>
      </div>
    </div>
  );
}

// --- Styles ---

const outerContainerStyle = css`
  display: flex;
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
  line-height: ${theme.typography['20Bold'].lineHeight};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  color: ${theme.colors.text.strong};
  margin: 0 0 12px;
`;

const descriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.text.default};
  line-height: 1.6;
  margin-bottom: 24px;
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
