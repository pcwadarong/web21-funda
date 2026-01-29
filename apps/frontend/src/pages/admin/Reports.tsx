import { useEffect, useState } from 'react';

import { ReportsContainer } from '@/feat/admin/components/ReportsContainer';
import { type ReportResponse, reportService } from '@/services/reportService';

export const Reports = () => {
  const [reports, setReports] = useState<ReportResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const data = await reportService.getReports();
        setReports(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, []);

  return <ReportsContainer reports={reports} loading={loading} error={error} />;
};
