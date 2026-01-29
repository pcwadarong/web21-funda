import { JsonlUploadCard } from '@/feat/admin/components/JsonlUploadCard';
import { useAdminJsonlUpload } from '@/feat/admin/hooks/useAdminJsonlUpload';
import { adminService, type UnitOverviewUploadSummary } from '@/services/adminService';

export function AdminUnitOverviewUpload() {
  const { status, result, busy, hasFile, onFileChange, onSubmit } =
    useAdminJsonlUpload<UnitOverviewUploadSummary>(adminService.uploadUnitOverviews);

  return (
    <JsonlUploadCard
      title="유닛 학습 개요 업로드"
      description={`unit_overview.jsonl 형식의 JSON Lines 파일을 업로드하면 unit_title 기준으로 유닛 개요를 업데이트합니다. 개요는 마크다운으로 작성할 수 있습니다.`}
      example={
        <>
          <strong>예시</strong>
          <pre
            style={{
              margin: '8px 0 0',
              fontFamily: 'monospace',
              fontSize: '13px',
              whiteSpace: 'pre-wrap',
            }}
          >
            {'{"unit_title":"HTML","overview":"### 개요\\n- 태그 구조"}'}
          </pre>
        </>
      }
      status={status}
      result={result}
      busy={busy}
      hasFile={hasFile}
      onFileChange={onFileChange}
      onSubmit={onSubmit}
      tip={
        <>
          <span style={{ marginRight: '6px' }}>💡</span>
          TIP: unit_title이 동일한 유닛이 여러 개면 모두 동일한 개요로 업데이트됩니다.
        </>
      }
    />
  );
}
