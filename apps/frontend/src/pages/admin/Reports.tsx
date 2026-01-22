import { css, useTheme } from '@emotion/react';
import { useEffect, useState } from 'react';

import { type ReportResponse, reportService } from '@/services/reportService';
import type { Theme } from '@/styles/theme';

export const Reports = () => {
  const theme = useTheme();
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

  if (loading) {
    return (
      <div css={containerStyle}>
        <div css={cardStyle(theme)}>
          <p css={loadingStyle(theme)}>로딩 중...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div css={containerStyle}>
        <div css={cardStyle(theme)}>
          <p css={errorStyle(theme)}>에러: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div css={containerStyle}>
      <div css={cardStyle(theme)}>
        <h1 css={titleStyle(theme)}>신고 목록</h1>

        <div css={tableWrapperStyle}>
          <table css={tableStyle(theme)}>
            <thead>
              <tr css={headerRowStyle(theme)}>
                <th css={cellStyle(theme)}>ID</th>
                <th css={cellStyle(theme)}>Quiz ID</th>
                <th css={cellStyle(theme)}>신고 내용</th>
                <th css={cellStyle(theme)}>날짜</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={4} css={emptyStyle(theme)}>
                    신고가 없습니다.
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id}>
                    <td css={cellStyle(theme)}>{report.id}</td>
                    <td css={cellStyle(theme)}>{report.quizId}</td>
                    <td css={cellStyle(theme)}>{report.report_description}</td>
                    <td css={cellStyle(theme)}>
                      {new Date(report.createdAt).toLocaleString('ko-KR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const containerStyle = css`
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 40px 24px;
  min-height: 100vh;
  width: 100%;

  @media (max-width: 768px) {
    padding: 0;
  }
`;

const cardStyle = (theme: Theme) => css`
  width: 100%;
  max-width: 1000px;
  background: ${theme.colors.surface.strong};
  padding: 32px;
  border-radius: ${theme.borderRadius.large};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    border-radius: 0;
    height: 100vh;
  }
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  color: ${theme.colors.text.strong};
  margin: 0 0 24px;
`;

const tableWrapperStyle = css`
  overflow-x: auto;
`;

const tableStyle = (theme: Theme) => css`
  width: 100%;
  border-collapse: collapse;
  border: 1px solid ${theme.colors.border.default};
`;

const headerRowStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface.default};
`;

const cellStyle = (theme: Theme) => css`
  padding: 12px 16px;
  border: 1px solid ${theme.colors.border.default};
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  text-align: left;
  word-break: break-word;

  th {
    font-weight: 700;
    color: ${theme.colors.text.strong};
  }
`;

const emptyStyle = (theme: Theme) => css`
  text-align: center;
  color: ${theme.colors.text.weak};
`;

const loadingStyle = (theme: Theme) => css`
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
`;

const errorStyle = (theme: Theme) => css`
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
`;
