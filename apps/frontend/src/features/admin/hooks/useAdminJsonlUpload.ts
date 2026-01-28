import { useCallback, useState } from 'react';

export interface UseAdminJsonlUploadReturn<TResult> {
  status: string;
  result: TResult | { error: string } | null;
  busy: boolean;
  hasFile: boolean;
  onFileChange: (filePresent: boolean) => void;
  onSubmit: (files: File[]) => Promise<void>;
}

/**
 * 관리자 JSONL 업로드 페이지 공통 로직(상태/에러 처리/버튼 활성화)을 캡슐화합니다.
 */
export function useAdminJsonlUpload<TResult>(
  uploadFn: (files: File[]) => Promise<TResult>,
): UseAdminJsonlUploadReturn<TResult> {
  const [status, setStatus] = useState('대기 중');
  const [result, setResult] = useState<TResult | { error: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const onFileChange = useCallback((filePresent: boolean) => {
    setHasFile(filePresent);
  }, []);

  const onSubmit = useCallback(
    async (files: File[]) => {
      setBusy(true);
      setStatus('업로드 중...');
      setResult(null);

      try {
        const parsed = await uploadFn(files);
        setStatus('업로드 완료');
        setResult(parsed);
      } catch (error) {
        setStatus('업로드 실패');
        setResult({ error: (error as Error).message });
      } finally {
        setBusy(false);
      }
    },
    [uploadFn],
  );

  return { status, result, busy, hasFile, onFileChange, onSubmit };
}
