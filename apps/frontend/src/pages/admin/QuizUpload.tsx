import { useCallback, useState } from 'react';
import { adminService, type UploadResponse } from '@/services/adminService';
import { AdminQuizUploadContainer } from '@/feat/admin/components/QuizUploadContainer';

export function AdminQuizUpload() {
  const [status, setStatus] = useState('대기 중');
  const [result, setResult] = useState<UploadResponse | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  // 파일 유무 상태 변경 핸들러
  const handleFileChange = useCallback((filePresent: boolean) => {
    setHasFile(filePresent);
  }, []);

  // 실제 API 호출 로직
  const handleUploadSubmit = useCallback(async (file: File) => {
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
  }, []);

  return (
    <AdminQuizUploadContainer
      status={status}
      result={result}
      busy={busy}
      hasFile={hasFile}
      onFileChange={handleFileChange}
      onSubmit={handleUploadSubmit}
    />
  );
}
