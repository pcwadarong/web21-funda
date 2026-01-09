import { css, useTheme } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import SVGIcon from '@/comp/SVGIcon';
import type { IconMapTypes } from '@/constants/icons';
import { useStorage } from '@/hooks/useStorage';
import type { Theme } from '@/styles/theme';

interface StudyField {
  slug: string;
  name: string;
  description: string;
  icon: IconMapTypes;
}

export const SelectField = () => {
  const theme = useTheme();
  const [fields, setFields] = useState<StudyField[]>([]);
  const navigate = useNavigate();
  const { updateUIState } = useStorage();
  useEffect(() => {
    const fetchFields = async () => {
      try {
        const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000/api';
        const response = await fetch(`${apiBaseUrl}/fields`);
        const data = await response.json();
        setFields(data.fields);
      } catch (error) {
        console.error('Failed to fetch fields:', error);
      }
    };

    fetchFields();
  }, []);
  const handleComplete = useCallback(
    (fieldSlug: string) => {
      navigate('/learn/roadmap');
      updateUIState({
        last_viewed: {
          field_slug: fieldSlug,
          unit_id: 1,
        },
      });
    },
    [navigate, updateUIState],
  );

  return (
    <main css={mainStyle}>
      <div css={titleWrapper}>
        <span css={title(theme)}>학습 분야 선택</span>
        <span css={subtitle(theme)}>어떤 분야를 선택하시겠어요?</span>
      </div>
      <div css={gridStyle}>
        {fields.map(field => (
          <label
            key={field.slug}
            onClick={() => handleComplete(field.slug)}
            css={fieldLabelStyle(theme)}
          >
            <div css={fieldNameWrapper}>
              <span css={fieldNameStyle(theme)}>{field.name}</span>
              <SVGIcon icon={field.icon} size="lg" />
            </div>
            <span css={fieldDescriptionStyle(theme)}>{field.description}</span>
            <div css={goLoadmap(theme)}>
              <span>로드맵 보기</span>

              <SVGIcon icon={'NextArrow'} size="sm" />
            </div>
          </label>
        ))}
      </div>
    </main>
  );
};
const mainStyle = css`
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  padding: 24px;
  gap: 24px;
  min-width: 75rem;
`;
const titleWrapper = css`
  display: flex;
  flex-direction: column;
`;
const title = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  color: ${theme.colors.primary.main};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  font-height: ${theme.typography['16Medium'].lineHeight};
`;
const subtitle = (theme: Theme) => css`
  font-size: ${theme.typography['20Medium'].fontSize};
  color: ${theme.colors.grayscale[600]};
  font-weight: ${theme.typography['20Medium'].fontWeight};
  font-height: ${theme.typography['20Medium'].lineHeight};
`;
const gridStyle = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
  margin-bottom: 1rem;
  width: 100%;
  height: 28rem;
`;
const fieldLabelStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 12px;
  padding: 24px 16px;
  background: ${theme.colors.surface.strong};
  border: 2px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  transition: all 150ms ease;
  box-shadow: 0 0.5rem 0 ${theme.colors.border.default};
  cursor: pointer;
  &:hover {
    transform: translateY(-2px);
  }

  color: ${theme.colors.text.default};
`;
const fieldDescriptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
  color: ${theme.colors.grayscale[700]};
`;
const fieldNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['20Bold'].fontSize};
  font-weight: ${theme.typography['20Bold'].fontWeight};
  line-height: ${theme.typography['20Bold'].lineHeight};
  color: ${theme.colors.grayscale[700]};
`;
const fieldNameWrapper = css`
  display: flex;
  justify-content: space-between;
  align-items: center;
`;
const goLoadmap = (theme: Theme) => css`
  display: flex;
  align-items: center;
  font-size: ${theme.typography['16Medium'].fontSize};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  line-height: ${theme.typography['16Medium'].lineHeight};
  color: ${theme.colors.primary.dark};
`;
