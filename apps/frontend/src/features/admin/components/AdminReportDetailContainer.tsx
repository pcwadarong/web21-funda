import { useTheme } from '@emotion/react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { AdminReportDetailView } from '@/feat/admin/components/AdminReportDetailView';
import { useAdminReportDetail } from '@/feat/admin/hooks/useAdminReportDetail';

export const AdminReportDetailContainer = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();

  const reportId = useMemo(() => Number(params.reportId), [params.reportId]);

  const detail = useAdminReportDetail({ reportId });

  return (
    <AdminReportDetailView
      theme={theme}
      reportId={reportId}
      onBack={() => navigate('/admin/quizzes/reports')}
      {...detail}
    />
  );
};
