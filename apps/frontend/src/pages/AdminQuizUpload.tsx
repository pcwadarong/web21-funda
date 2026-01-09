import { useMemo, useState } from 'react';

type UploadSummary = {
  processed: number;
  fieldsCreated: number;
  fieldsUpdated: number;
  unitsCreated: number;
  unitsUpdated: number;
  stepsCreated: number;
  stepsUpdated: number;
  quizzesCreated: number;
  quizzesUpdated: number;
};

type UploadResponse =
  | { summary: UploadSummary }
  | { message: string; frontendPath?: string; error?: string }
  | { error: string };

const cardStyle: React.CSSProperties = {
  maxWidth: 820,
  margin: '64px auto',
  padding: '28px',
  borderRadius: 14,
  background: 'linear-gradient(180deg, #0b132b 0%, #0f172a 100%)',
  border: '1px solid #1f2937',
  boxShadow: '0 18px 55px rgba(0,0,0,0.45)',
  color: '#e2e8f0',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  marginBottom: 8,
  fontWeight: 700,
  color: '#f8fafc',
};

const fileInputStyle: React.CSSProperties = {
  width: '100%',
  padding: '12px',
  border: '1px dashed #334155',
  borderRadius: 10,
  background: '#0b1220',
  color: '#e2e8f0',
};

const buttonStyle: React.CSSProperties = {
  marginTop: 16,
  padding: '14px 16px',
  width: '100%',
  border: 'none',
  borderRadius: 10,
  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
  color: '#0f172a',
  fontWeight: 800,
  cursor: 'pointer',
  letterSpacing: 0.1,
};

const statusBoxStyle: React.CSSProperties = {
  marginTop: 14,
  padding: '12px 14px',
  borderRadius: 10,
  border: '1px solid #1f2937',
  background: '#0b1220',
  color: '#cbd5e1',
};

const preStyle: React.CSSProperties = {
  marginTop: 10,
  padding: 14,
  borderRadius: 10,
  border: '1px solid #1f2937',
  background: '#0b1220',
  color: '#d1d5db',
  overflow: 'auto',
  maxHeight: 360,
};

export function AdminQuizUpload() {
  const [status, setStatus] = useState('대기 중');
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [busy, setBusy] = useState(false);

  const prettyResult = useMemo(() => {
    if (!result) return '{}';
    return JSON.stringify(result, null, 2);
  }, [result]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async event => {
    event.preventDefault();
    const form = event.currentTarget;
    const fileInput = form.querySelector<HTMLInputElement>('input[type="file"]');
    const file = fileInput?.files?.item(0);
    if (!file) {
      alert('JSONL 파일을 선택해주세요.');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);

    setBusy(true);
    setStatus('업로드 중...');
    setResult(null);

    try {
      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
      const response = await fetch(`${API_BASE_URL}/admin/quizzes/upload`, {
        method: 'POST',
        body: formData,
      });
      const text = await response.text();
      let parsed: UploadResponse;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { error: text || '응답을 해석할 수 없습니다.' };
      }

      if (!response.ok) {
        const message =
          (parsed as { message?: string }).message ||
          (parsed as { error?: string }).error ||
          '업로드 실패';
        throw new Error(message);
      }

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
    <div style={{ minHeight: '100vh', background: '#050914' }}>
      <div style={cardStyle}>
        <h1 style={{ margin: '0 0 12px', color: '#f8fafc', letterSpacing: 0.2 }}>
          JSONL 퀴즈 업로드
        </h1>
        <p style={{ margin: '0 0 18px', color: '#cbd5e1', lineHeight: 1.6 }}>
          quizzes.jsonl 형식의 JSON Lines 파일을 업로드하면 필드 → 유닛 → 스텝 → 퀴즈 순으로
          업서트합니다. order_index가 없으면 자동으로 부모 레코드 개수 + 1을 사용합니다.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="file" style={labelStyle}>
            JSONL 파일
          </label>
          <input
            id="file"
            name="file"
            type="file"
            accept=".jsonl,.txt,.json"
            style={fileInputStyle}
          />
          <button type="submit" style={buttonStyle} disabled={busy}>
            {busy ? '업로드 중...' : '업로드 실행'}
          </button>
        </form>

        <div style={statusBoxStyle}>{status}</div>
        <pre style={preStyle}>{prettyResult}</pre>
        <div style={{ color: '#94a3b8', marginTop: 8, fontSize: 14 }}>
          TIP: 잘못된 JSON 라인이 있으면 에러 메시지에 라인 번호가 표시됩니다.
        </div>
      </div>
    </div>
  );
}
