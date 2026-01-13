import { css, useTheme } from '@emotion/react';
import { useState } from 'react';

import { Button } from '@/comp/Button';
import SVGIcon from '@/comp/SVGIcon';
import { reportService } from '@/services/reportService';
import { useModal } from '@/store/modalStore';
import type { Theme } from '@/styles/theme';

interface ReportModalProps {
  quizId: number;
}
const reportOptions = [
  { id: 'not-visible', label: '문제가 보이지않아요' },
  { id: 'wrong-answer', label: '정답이 잘못된 것 같아요' },
  { id: 'typo', label: '문제/해설에 오타가 있어요' },
  { id: 'other', label: '기타' },
];

const ReportModal = ({ quizId }: ReportModalProps) => {
  const theme = useTheme();
  const { closeModal } = useModal();
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [otherText, setOtherText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!selectedOption) return;

    const selectedLabel = reportOptions.find(o => o.id === selectedOption)?.label || '';
    const report_description = selectedOption === 'other' ? otherText : selectedLabel;

    try {
      setIsSubmitting(true);
      const response = await reportService.createReport(quizId, {
        report_description,
      });
      if (response.isSuccess) {
        console.log('신고가 성공적으로 전송되었습니다.');
      }

      setSelectedOption(null);
      setOtherText('');
      closeModal();
    } catch (error) {
      console.error('신고 전송 중 오류:', error);
      alert(error instanceof Error ? error.message : '신고 전송에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <p css={labelStyle(theme)}>신고 유형</p>

      <div css={optionsContainerStyle}>
        {reportOptions.map(option => (
          <div
            key={option.id}
            css={optionStyle(theme)}
            onClick={() => setSelectedOption(option.id)}
          >
            <div
              css={[
                checkboxStyle(theme),
                selectedOption === option.id && checkboxCheckedStyle(theme),
              ]}
            >
              {selectedOption === option.id && <SVGIcon icon="Check" size="xs" />}
            </div>
            <span css={optionTextStyle(theme)}>{option.label}</span>
          </div>
        ))}
      </div>

      {selectedOption === 'other' && (
        <div css={textareaContainerStyle}>
          <textarea
            value={otherText}
            onChange={e => setOtherText(e.target.value)}
            placeholder="상세 내용을 입력해주세요..."
            css={textareaStyle(theme)}
          />
        </div>
      )}

      <Button
        variant="primary"
        disabled={!selectedOption || (selectedOption === 'other' && !otherText.trim())}
        onClick={handleSubmit}
        css={btn}
      >
        {isSubmitting ? '신고 중...' : '신고하기'}
      </Button>
    </div>
  );
};

const labelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.weak};
  margin-bottom: 16px;
`;

const optionsContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
`;

const optionStyle = (theme: Theme) => css`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  cursor: pointer;
  transition: all 0.2s;
  background: transparent;

  &:hover {
    background: ${theme.colors.surface.default};
  }
`;

const checkboxStyle = (theme: Theme) => css`
  width: 20px;
  height: 20px;
  border-radius: ${theme.borderRadius.xsmall};
  border: 2px solid ${theme.colors.border.default};
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background 0.2s,
    border-color 0.2s;
`;

const checkboxCheckedStyle = (theme: Theme) => css`
  border-color: ${theme.colors.primary.main};
  color: ${theme.colors.primary.main};
`;

const optionTextStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  color: ${theme.colors.text.default};
`;

const textareaContainerStyle = css`
  margin-bottom: 24px;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const textareaStyle = (theme: Theme) => css`
  width: 100%;
  height: 96px;
  background: ${theme.colors.surface.default};
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  padding: 16px;
  color: ${theme.colors.text.default};
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  font-weight: ${theme.typography['16Medium'].fontWeight};
  resize: none;
  transition: all 0.2s;

  &::placeholder {
    color: ${theme.colors.text.weak};
  }

  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px ${theme.colors.primary.main}33;
  }
`;

const btn = css`
  width: 100%;
`;

export default ReportModal;
