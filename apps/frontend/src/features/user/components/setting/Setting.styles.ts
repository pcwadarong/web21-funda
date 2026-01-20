import { css, type Theme } from '@emotion/react';

export const sectionCardStyle = (theme: Theme) => css`
  width: 100%;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 20px 24px;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.1);
`;

export const contentGroupStyle = css`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

export const sectionTitleStyle = (theme: Theme) => css`
  color: ${theme.colors.primary.main};
  font-size: ${theme.typography['16Bold'].fontSize};
  line-height: ${theme.typography['16Bold'].lineHeight};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  margin: 0 0 16px 0;
`;

export const rowStyle = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 40px;
  gap: 16px;
  flex-wrap: wrap;
`;

export const labelGroupStyle = css`
  margin: 0;
  white-space: nowrap;
  flex-shrink: 0;
  flex-grow: 1;
`;
