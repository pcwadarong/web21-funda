import { useCallback, useState } from 'react';

import { UnitOverviewUploadContainer } from '@/feat/admin/components/UnitOverviewUploadContainer';
import { adminService, type UnitOverviewUploadSummary } from '@/services/adminService';

type UnitOverviewUploadResult = UnitOverviewUploadSummary | { error: string };

export function AdminUnitOverviewUpload() {
  const [status, setStatus] = useState('대기 중');
  const [result, setResult] = useState<UnitOverviewUploadResult | null>(null);
  const [busy, setBusy] = useState(false);
  const [hasFile, setHasFile] = useState(false);

  const handleFileChange = useCallback((filePresent: boolean) => {
    setHasFile(filePresent);
  }, []);

  const handleUploadSubmit = useCallback(async (files: File[]) => {
    setBusy(true);
    setStatus('업로드 중...');
    setResult(null);

    try {
      const parsed = await adminService.uploadUnitOverviews(files);
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
    <UnitOverviewUploadContainer
      status={status}
      result={result}
      busy={busy}
      hasFile={hasFile}
      onFileChange={handleFileChange}
      onSubmit={handleUploadSubmit}
    />
  );
}
