import { JsonlUploadCard } from '@/feat/admin/components/JsonlUploadCard';
import { useAdminJsonlUpload } from '@/feat/admin/hooks/useAdminJsonlUpload';
import { adminService, type UploadResponse } from '@/services/adminService';

export function AdminQuizUpload() {
  const { status, result, busy, hasFile, onFileChange, onSubmit } =
    useAdminJsonlUpload<UploadResponse>(adminService.uploadQuizzes);

  return (
    <JsonlUploadCard
      title="JSONL 퀴즈 업로드"
      description={`quizzes.jsonl 형식의 JSON Lines 파일을 업로드하면 필드 → 유닛 → 스텝 → 퀴즈 순으로 업서트합니다. order_index가 없으면 자동으로 부모 레코드 개수 + 1을 사용합니다.`}
      status={status}
      result={result}
      busy={busy}
      hasFile={hasFile}
      onFileChange={onFileChange}
      onSubmit={onSubmit}
      tip={
        <>
          <span style={{ marginRight: '6px' }}>💡</span>
          TIP: 잘못된 JSON 라인이 있으면 에러 메시지에 라인 번호가 표시됩니다.
        </>
      }
    />
  );
}
