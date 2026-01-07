import { css, useTheme } from '@emotion/react';
import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import type { IconMapTypes } from '@/constants/icons';
import type { Theme } from '@/styles/theme';

interface StudyField {
  id: string;
  name: string;
  icon: IconMapTypes;
}

// TODO: /api/fields 연동
const STUDY_FIELDS: StudyField[] = [
  { id: 'frontend', name: '프론트엔드', icon: 'Frontend' },
  { id: 'backend', name: '백엔드', icon: 'Backend' },
  { id: 'mobile', name: '모바일', icon: 'Mobile' },
  { id: 'cs', name: 'CS 기초', icon: 'ComputerScience' },
  { id: 'algorithm', name: '알고리즘', icon: 'Algorithm' },
  { id: 'game', name: '게임 개발', icon: 'Game' },
  { id: 'data', name: '데이터/AI 기초', icon: 'Data' },
  { id: 'devops', name: '데브옵스', icon: 'Cloud' },
] as const;

export const InitialFields = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [selectedField, setSelectedField] = useState<string | null>(null);

  const handleFieldChange = useCallback((fieldId: string) => {
    setSelectedField(prev => (prev === fieldId ? null : fieldId));
  }, []);

  const handleComplete = useCallback(() => {
    navigate('/quiz');
  }, [navigate]);

  return (
    <div css={containerStyle()}>
      <div css={panelStyle(theme)}>
        <h1 css={titleStyle(theme)}>어떤 분야를 공부하고 싶나요?</h1>
        <p css={instructionStyle(theme)}>1개를 선택해주세요.</p>
        <div css={gridStyle}>
          {STUDY_FIELDS.map(field => {
            const isSelected = selectedField === field.id;
            return (
              <label key={field.id} css={fieldLabelStyle(theme, isSelected)}>
                <input
                  type="radio"
                  name="studyField"
                  value={field.id}
                  checked={isSelected}
                  onChange={() => handleFieldChange(field.id)}
                  css={radioInputStyle}
                />
                {isSelected && <span css={checkmarkStyle}>✓</span>}
                <span css={iconStyle}>
                  <SVGIcon icon={field.icon} size="lg" />
                </span>
                <span css={fieldNameStyle(theme)}>{field.name}</span>
              </label>
            );
          })}
        </div>
        <Button
          variant="primary"
          onClick={handleComplete}
          disabled={selectedField === null}
          fullWidth
        >
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

const panelStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.large};
  padding: 48px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  max-width: 800px;
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
  margin: 0;
  text-align: center;
`;

const gridStyle = css`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

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
  box-shadow: ${isSelected
    ? `0 4px 12px ${theme.colors.primary.surface}`
    : '0 2px 8px rgba(0, 0, 0, 0.05)'};
  cursor: pointer;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const radioInputStyle = css`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

const checkmarkStyle = css`
  position: absolute;
  top: 8px;
  right: 8px;
  width: 24px;
  height: 24px;
  background: #02d05c;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 14px;
  font-weight: bold;
`;

const iconStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
`;

const fieldNameStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};
`;
