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
          <div css={statusBoxStyle(theme)}>
            <p css={loadingStyle(theme)}>로딩 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div css={containerStyle}>
        <div css={cardStyle(theme)}>
          <div css={statusBoxStyle(theme)}>
            <p css={errorStyle(theme)}>에러: {error}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div css={containerStyle}>
      <div css={cardStyle(theme)}>
        <header css={headerStyle}>
          <h1 css={titleStyle(theme)}>신고 목록</h1>
          <p css={subtitleStyle(theme)}>신고된 퀴즈와 사용자 정보를 확인하세요.</p>
        </header>

        <div css={tableWrapperStyle}>
          <table css={tableStyle}>
            <thead>
              <tr css={headerRowStyle(theme)}>
                <th css={idCellStyle(theme)}>ID</th>
                <th css={quizIdCellStyle(theme)}>Quiz ID</th>
                <th css={questionCellStyle(theme)}>문제</th>
                <th css={cellStyle(theme)}>유저</th>
                <th css={reportContentCellStyle(theme)}>신고 내용</th>
                <th css={cellStyle(theme)}>날짜</th>
              </tr>
            </thead>
            <tbody>
              {reports.length === 0 ? (
                <tr>
                  <td colSpan={6} css={emptyStyle(theme)}>
                    신고가 없습니다.
                  </td>
                </tr>
              ) : (
                reports.map(report => (
                  <tr key={report.id}>
                    <td css={idCellStyle(theme)}>{report.id}</td>
                    <td css={quizIdCellStyle(theme)}>{report.quizId}</td>
                    <td css={questionCellStyle(theme)}>{report.question ?? '-'}</td>
                    <td css={cellStyle(theme)}>
                      {report.userDisplayName
                        ? `${report.userDisplayName} (#${report.userId})`
                        : '게스트'}
                    </td>
                    <td css={reportContentCellStyle(theme)}>{report.report_description}</td>
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
  flex: 1;
  min-height: 100vh;
  padding: 32px 24px 120px;
  width: 100%;
  display: flex;
  justify-content: center;
`;

const cardStyle = (theme: Theme) => css`
  width: 100%;
  max-width: 1200px;
  background: ${theme.colors.surface.strong};
  padding: 24px;
  border-radius: ${theme.borderRadius.large};
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
  border: 1px solid ${theme.colors.border.default};
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: calc(100vh - 200px);
  overflow: hidden;

  @media (max-width: 768px) {
    height: calc(100vh - 120px);
    padding: 20px;
  }
`;

const headerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  color: ${theme.colors.text.strong};
  margin: 0;
`;

const subtitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  margin: 0;
`;

const tableWrapperStyle = css`
  flex: 1;
  overflow: auto;
  border-radius: 12px;
`;

const tableStyle = css`
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
`;

const headerRowStyle = (theme: Theme) => css`
  background-color: ${theme.colors.surface.bold};
  position: sticky;
  top: 0;
  z-index: 1;
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

const reportContentCellStyle = (theme: Theme) => css`
  ${cellStyle(theme)};
  width: 34%;
`;

const questionCellStyle = (theme: Theme) => css`
  ${cellStyle(theme)};
  width: 26%;
`;

const idCellStyle = (theme: Theme) => css`
  ${cellStyle(theme)};
  width: 6%;
  min-width: 60px;
`;

const quizIdCellStyle = (theme: Theme) => css`
  ${cellStyle(theme)};
  width: 8%;
  min-width: 80px;
`;

const emptyStyle = (theme: Theme) => css`
  text-align: center;
  color: ${theme.colors.text.weak};
`;

const statusBoxStyle = (theme: Theme) => css`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
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
