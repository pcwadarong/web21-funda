import { css, useTheme } from '@emotion/react';
import { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import type { IconMapTypes } from '@/constants/icons';
import { useStorage } from '@/hooks/useStorage';
import type { Theme } from '@/styles/theme';

interface StudyFieldResponse {
  slug: string;
  name: string;
  description: string;
  icon: IconMapTypes;
}

export const InitialFields = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState<string | null>(null);
  const { updateUIState } = useStorage();
  const [fields, setFields] = useState<StudyFieldResponse[]>([]);

  useEffect(() => {
    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? '/api';
    const fetchFields = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/fields`);
        if (!response.ok) throw new Error('데이터 로드 실패');

        const data = await response.json();
        setFields(data.fields);
      } catch (error) {
        console.error('API Error:', error);
      }
    };

    fetchFields();
  }, []);

  const handleFieldChange = useCallback((slug: string) => {
    setSelectedField(prev => (prev === slug ? null : slug));
  }, []);

  const handleComplete = useCallback(() => {
    if (!selectedField) return; // null 체크
    navigate('/quiz');
    // TODO: API 호출해서 실제 첫 번째 스텝으로 수정
    updateUIState({
      last_viewed: {
        field_slug: selectedField,
        unit_id: 1,
      },
    });
  }, [navigate, selectedField, updateUIState]);

  return (
    <div css={containerStyle()}>
      <div css={panelStyle}>
        <h1 css={titleStyle(theme)}>어떤 분야를 공부하고 싶나요?</h1>
        <p css={instructionStyle(theme)}>학습을 시작하고 싶은 분야를 1개 선택해주세요.</p>
        <div css={gridStyle}>
          {fields.map(field => {
            const isSelected = selectedField === field.slug;
            return (
              <label key={field.slug} css={fieldLabelStyle(theme, isSelected)}>
                <input
                  type="radio"
                  name="studyField"
                  value={field.slug}
                  checked={isSelected}
                  onChange={() => handleFieldChange(field.slug)}
                  css={radioInputStyle}
                />
                {isSelected && (
                  <span css={checkmarkStyle}>
                    <SVGIcon icon="Check" aria-hidden="true" size="xs" />
                  </span>
                )}
                <SVGIcon icon={field.icon} size="lg" />
                <span css={fieldNameStyle(theme)}>{field.name}</span>
              </label>
            );
          })}
        </div>
        <Button variant="primary" onClick={handleComplete} disabled={selectedField === null}>
          선택 완료하고 시작하기
        </Button>
      </div>
    </div>
  );
};

const containerStyle = () => css`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
`;

const panelStyle = css`
  padding: 48px;
  max-width: 60rem;
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const titleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['24Bold'].fontSize};
  line-height: ${theme.typography['24Bold'].lineHeight};
  font-weight: ${theme.typography['24Bold'].fontWeight};
  color: ${theme.colors.primary.main};
  margin: 0;
  text-align: center;
`;

const instructionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.weak};
  margin-top: 0;
  text-align: center;
`;

const gridStyle = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1.2rem;
  margin-bottom: 1rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const fieldLabelStyle = (theme: Theme, isSelected: boolean) => css`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 24px 16px;
  background: ${theme.colors.surface.strong};
  border: 2px solid ${isSelected ? theme.colors.primary.main : theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  transition: all 150ms ease;
  box-shadow: 0 0.5rem 0 ${theme.colors.border.default};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
  }

  color: ${theme.colors.text.default};
`;

const radioInputStyle = css`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const checkmarkStyle = css`
  position: absolute;
  top: -5px;
  right: -5px;
  width: 1.5rem;
  height: 1.5rem;
  background: #02d05c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const fieldNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
`;
