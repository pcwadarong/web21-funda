import { css, useTheme } from '@emotion/react';
import { useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { MarkdownRenderer } from '@/comp/MarkdownRenderer';
import SVGIcon from '@/comp/SVGIcon';
import { Loading } from '@/components/Loading';
import { useUnitOverview } from '@/hooks/queries/unitQueries';
import type { Theme } from '@/styles/theme';

export const Overview = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { unitId } = useParams<{ unitId: string }>();

  const parsedUnitId = useMemo(() => {
    if (!unitId) {
      return null;
    }

    const value = Number(unitId);
    if (!Number.isInteger(value) || value <= 0) {
      return null;
    }

    return value;
  }, [unitId]);

  const { data, isLoading, error } = useUnitOverview(parsedUnitId);

  const overviewText = data?.unit.overview ?? '';
  const hasOverview = overviewText.trim().length > 0;

  const handleBackClick = () => {
    navigate(-1);
  };

  if (parsedUnitId === null) {
    return (
      <div css={mainStyle}>
        <button type="button" css={backButtonStyle(theme)} onClick={handleBackClick}>
          <SVGIcon icon="ArrowLeft" size="sm" />
          돌아가기
        </button>
        <div css={messageStyle(theme)}>유닛 정보를 찾지 못했습니다.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div css={mainStyle}>
        <button type="button" css={backButtonStyle(theme)} onClick={handleBackClick}>
          <SVGIcon icon="ArrowLeft" size="sm" />
          돌아가기
        </button>
        <div css={loadingStyle}>
          <Loading text="학습 개요를 불러오는 중입니다." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div css={mainStyle}>
        <button type="button" css={backButtonStyle(theme)} onClick={handleBackClick}>
          <SVGIcon icon="ArrowLeft" size="sm" />
          돌아가기
        </button>
        <div css={messageStyle(theme)}>
          학습 개요를 불러오지 못했습니다.
          <span css={errorDetailStyle(theme)}>{error.message}</span>
        </div>
      </div>
    );
  }

  return (
    <div css={mainStyle}>
      <header css={headerStyle}>
        <button type="button" css={backButtonStyle(theme)} onClick={handleBackClick}>
          <SVGIcon icon="ArrowLeft" size="sm" />
          돌아가기
        </button>
        <div css={titleStyle(theme)}>{data?.unit.title ?? '학습 개요'}</div>
      </header>
      <section css={contentStyle(theme)}>
        {hasOverview ? (
          <MarkdownRenderer text={overviewText} />
        ) : (
          <div css={messageStyle(theme)}>아직 작성된 학습 개요가 없습니다.</div>
        )}
      </section>
    </div>
  );
};

const mainStyle = css`
  max-width: 960px;
  margin: 0 auto;
  padding: 24px 20px 0;
  display: flex;
  flex-direction: column;
  gap: 16px;

  @media (max-width: 768px) {
    padding: 16px 12px 0;
  }
`;

const headerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const backButtonStyle = (theme: Theme) => css`
  background: transparent;
  border: none;
  color: ${theme.colors.text.light};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
  font-weight: ${theme.typography['12Medium'].fontWeight};
  padding: 0;
  width: fit-content;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  line-height: ${theme.typography['20Medium'].lineHeight};
  font-weight: ${theme.typography['20Medium'].fontWeight};
  color: ${theme.colors.grayscale[700]};
`;

const contentStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: 16px;
  padding: 32px;
  min-height: 320px;
  max-height: calc(100vh - 8rem);
  overflow-y: hidden;

  &:hover {
    padding: 32px 16px;
    overflow-y: auto;
    scrollbar-gutter: stable both-edges;
  }

  &::-webkit-scrollbar {
    width: 16px;
    background: transparent;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
    border: none;
  }

  &::-webkit-scrollbar-thumb {
    background-color: #b2b2b2;
    border-radius: 10px;
    border: 5px solid transparent;

    /* Clips the background so it doesn't bleed into the border area */
    background-clip: padding-box;
  }

  @media (max-width: 768px) {
    max-height: calc(100vh - 14rem);
  }
`;

const loadingStyle = css`
  display: flex;
  justify-content: center;
  padding: 32px 0;
`;

const messageStyle = (theme: Theme) => css`
  color: ${theme.colors.text.light};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
`;

const errorDetailStyle = (theme: Theme) => css`
  display: block;
  margin-top: 6px;
  color: ${theme.colors.text.light};
  font-size: ${theme.typography['12Medium'].fontSize};
  line-height: ${theme.typography['12Medium'].lineHeight};
`;
