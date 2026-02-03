import { css, useTheme } from '@emotion/react';

import type { ReportResponse } from '@/services/reportService';
import type { Theme } from '@/styles/theme';

export interface ReportsContainerProps {
  reports: ReportResponse[];
  loading: boolean;
  error: string | null;
}

export const ReportsContainer = ({ reports, loading, error }: ReportsContainerProps) => {
  const theme = useTheme();

  if (loading) {
    return (
      <div css={statusBoxStyle(theme)}>
        <p css={statusTextStyle(theme)}>로딩 중...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div css={statusBoxStyle(theme)}>
        <p css={statusTextStyle(theme)}>에러: {error}</p>
      </div>
    );
  }

  return (
    <div css={tableWrapperStyle}>
      <div css={gridStyle(theme)} role="table" aria-label="신고 목록">
        <div css={headerRowStyle(theme)} role="row">
          <div css={headerCellStyle(theme)} role="columnheader" aria-label="ID">
            ID
          </div>
          <div css={headerCellStyle(theme)} role="columnheader" aria-label="Quiz ID">
            Quiz ID
          </div>
          <div css={headerCellStyle(theme)} role="columnheader" aria-label="문제">
            문제
          </div>
          <div css={headerCellStyle(theme)} role="columnheader" aria-label="유저">
            유저
          </div>
          <div css={headerCellStyle(theme)} role="columnheader" aria-label="신고 내용">
            신고 내용
          </div>
          <div css={headerCellStyle(theme)} role="columnheader" aria-label="날짜">
            날짜
          </div>
        </div>
        {reports.length === 0 ? (
          <div css={emptyRowStyle(theme)} role="row">
            신고가 없습니다.
          </div>
        ) : (
          reports.map(report => (
            <div key={report.id} css={gridRowStyle(theme)} role="row">
              <div css={cellStyle(theme)} role="cell">
                {report.id}
              </div>
              <div css={cellStyle(theme)} role="cell">
                {report.quizId}
              </div>
              <div css={cellStyle(theme)} role="cell">
                {report.question ?? '-'}
              </div>
              <div css={cellStyle(theme)} role="cell">
                {report.userDisplayName
                  ? report.userId
                    ? `${report.userDisplayName} (#${report.userId})`
                    : report.userDisplayName
                  : '게스트'}
              </div>
              <div css={cellStyle(theme)} role="cell">
                {report.report_description}
              </div>
              <div css={cellStyle(theme)} role="cell">
                {new Date(report.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

const tableWrapperStyle = css`
  border-radius: 12px;
  border: 1px solid rgba(0, 0, 0, 0.04);
  overflow-x: auto;
  -webkit-overflow-scrolling: touch;
  width: 100%;
  display: block;
  background: white;
`;

const gridStyle = (theme: Theme) => css`
  min-width: 860px;
  background: ${theme.colors.surface.strong};
  display: grid;
  grid-auto-rows: minmax(52px, auto);
`;

const headerRowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns:
    80px 90px minmax(180px, 2fr) minmax(160px, 1.3fr) minmax(220px, 2.2fr)
    160px;
  background-color: ${theme.colors.surface.bold};
  position: sticky;
  top: 0;
  z-index: 1;
  border-bottom: 1px solid ${theme.colors.border.default};
`;

const gridRowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns:
    80px 90px minmax(180px, 2fr) minmax(160px, 1.3fr) minmax(220px, 2.2fr)
    160px;
  border-bottom: 1px solid ${theme.colors.border.default};
`;

const cellStyle = (theme: Theme) => css`
  padding: 12px 16px;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  text-align: left;
  word-break: break-word;
  display: flex;
  align-items: center;
  min-width: 0;
`;

const headerCellStyle = (theme: Theme) => css`
  ${cellStyle(theme)};
  font-weight: 700;
  color: ${theme.colors.text.strong};
`;

const emptyStyle = (theme: Theme) => css`
  text-align: center;
  color: ${theme.colors.text.weak};
`;

const emptyRowStyle = (theme: Theme) => css`
  ${emptyStyle(theme)};
  padding: 32px 16px;
  grid-column: 1 / -1;
`;

const statusBoxStyle = (theme: Theme) => css`
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 240px;
  padding: 24px;
  color: ${theme.colors.text.weak};
`;

const statusTextStyle = (theme: Theme) => css`
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
`;
