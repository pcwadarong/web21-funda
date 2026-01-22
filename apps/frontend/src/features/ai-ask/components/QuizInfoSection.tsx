import { css, useTheme } from '@emotion/react';

import { CodeBlock } from '@/comp/CodeBlock';
import type { CorrectAnswerType } from '@/feat/quiz/types';
import type { Theme } from '@/styles/theme';
import { TextWithCodeStyle } from '@/utils/textParser';

import type { QuizPreview } from './types';
import { extractCorrectOptionId, extractCorrectPairs } from './utils';

/**
 * 퀴즈 정보 섹션 컴포넌트 Props
 */
interface QuizInfoSectionProps {
  /** 퀴즈 미리보기 데이터 (문제, 선지, 코드, 매칭 정보 등) */
  preview: QuizPreview;
  /** 정답 데이터 (퀴즈 타입에 따라 구조가 다름) */
  correctAnswer: CorrectAnswerType | null;
}

/**
 * 퀴즈 문제 정보를 표시하는 섹션 컴포넌트
 *
 * @description
 * - 문제 제목과 내용 표시
 * - 코드가 있는 경우 코드 블록 표시
 * - 정답 정보를 퀴즈 타입에 맞게 표시:
 *   - MCQ/Code: 모든 선지 표시, 정답 강조
 *   - OX: 정답만 표시 (O 또는 X)
 *   - Matching: 정답 쌍 표시 또는 양쪽 항목 분리 표시
 *
 * @param props - 컴포넌트 props
 * @returns 퀴즈 정보 섹션 JSX 요소
 */
export const QuizInfoSection = ({ preview, correctAnswer }: QuizInfoSectionProps) => {
  const theme = useTheme();

  return (
    <section css={summaryStyle(theme)} aria-labelledby="quiz-info-title">
      <h2 id="quiz-info-title" css={summaryTitleStyle(theme)}>
        문제 정보
      </h2>
      <h3 css={summaryQuestionStyle(theme)}>
        <TextWithCodeStyle text={`Q. ${preview.question}`} />
      </h3>
      {preview.code && (
        <section css={sectionBlockStyle} aria-labelledby="quiz-code-title">
          <h3 id="quiz-code-title" css={sectionLabelStyle(theme)}>
            코드
          </h3>
          <CodeBlock language={preview.code.language}>{preview.code.snippet}</CodeBlock>
        </section>
      )}
      <section css={sectionBlockStyle} aria-labelledby="quiz-answer-title">
        <h3 id="quiz-answer-title" css={sectionLabelStyle(theme)}>
          정답
        </h3>
        {preview.matching
          ? renderMatching(theme, preview, correctAnswer)
          : renderOptions(theme, preview, correctAnswer)}
      </section>
    </section>
  );
};

/**
 * 선지 옵션을 렌더링한다. (MCQ, Code, OX)
 *
 * @param theme 테마
 * @param preview 퀴즈 미리보기 데이터
 * @param correctAnswer 정답 데이터
 * @returns JSX 요소
 */
const renderOptions = (
  theme: Theme,
  preview: QuizPreview,
  correctAnswer: CorrectAnswerType | null,
) => {
  const correctOptionId = extractCorrectOptionId(correctAnswer);

  // OX 타입인 경우
  if (preview.type === 'ox') {
    if (correctOptionId) {
      const answerText = correctOptionId.toLowerCase() === 'o' ? 'O' : 'X';
      return (
        <div css={oxAnswerStyle(theme)}>
          <TextWithCodeStyle text={`${answerText}`} />
        </div>
      );
    }
    return null;
  }

  // MCQ, Code 타입인 경우
  return (
    <ul css={summaryOptionStyle(theme)}>
      {preview.options.map(option => {
        const isCorrect = correctOptionId === option.id;
        return (
          <li key={option.id} css={isCorrect ? correctOptionItemStyle(theme) : undefined}>
            <TextWithCodeStyle text={option.text} />
          </li>
        );
      })}
    </ul>
  );
};

/**
 * 매칭 항목을 렌더링한다.
 *
 * @param theme 테마
 * @param preview 퀴즈 미리보기 데이터
 * @param correctAnswer 정답 데이터
 * @returns JSX 요소
 */
const renderMatching = (
  theme: Theme,
  preview: QuizPreview,
  correctAnswer: CorrectAnswerType | null,
) => {
  const correctPairs = extractCorrectPairs(correctAnswer);

  if (!preview.matching) return null;

  // 정답이 있는 경우 정답 쌍을 표시
  if (correctPairs && correctPairs.length > 0) {
    return (
      <div css={matchingAnswerContainerStyle}>
        <ul css={matchingAnswerListStyle}>
          {correctPairs.map((pair, index) => {
            const leftItem = preview.matching!.left.find(item => item.id === pair.left);
            const rightItem = preview.matching!.right.find(item => item.id === pair.right);
            return (
              <li key={index} css={matchingAnswerItemStyle(theme)}>
                <TextWithCodeStyle text={leftItem?.text || pair.left} /> -{' '}
                <TextWithCodeStyle text={rightItem?.text || pair.right} />
              </li>
            );
          })}
        </ul>
      </div>
    );
  }

  // 정답이 없는 경우 기존 방식으로 표시
  return (
    <div css={matchingGridStyle}>
      <div>
        <div css={matchingLabelStyle(theme)}>왼쪽</div>
        <ul css={summaryOptionStyle(theme)}>
          {preview.matching.left.map(item => (
            <li key={item.id}>
              <TextWithCodeStyle text={item.text} />
            </li>
          ))}
        </ul>
      </div>
      <div>
        <div css={matchingLabelStyle(theme)}>오른쪽</div>
        <ul css={summaryOptionStyle(theme)}>
          {preview.matching.right.map(item => (
            <li key={item.id}>
              <TextWithCodeStyle text={item.text} />
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const summaryStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.default};
  border-radius: 12px;
  padding: 16px;
`;

const summaryTitleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  line-height: ${theme.typography['12Bold'].lineHeight};
  color: ${theme.colors.text.weak};
  margin-bottom: 8px;
`;

const summaryQuestionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  line-height: ${theme.typography['16Bold'].lineHeight};
  color: ${theme.colors.text.strong};
  margin-bottom: 8px;
  overflow-wrap: anywhere;
  word-break: break-word;
`;

const summaryOptionStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  display: flex;
  flex-direction: column;
  gap: 6px;

  li {
    background: ${theme.colors.surface.strong};
    border-radius: ${theme.borderRadius.small};
    padding: 4px 10px;
  }
`;

const sectionBlockStyle = css`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const sectionLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Bold'].fontSize};
  font-weight: ${theme.typography['12Bold'].fontWeight};
  color: ${theme.colors.text.light};
`;

const matchingGridStyle = css`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const matchingLabelStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  margin-bottom: 4px;
`;

const correctOptionItemStyle = (theme: Theme) => css`
  outline: 1.5px solid ${theme.colors.primary.light};
  border-radius: ${theme.borderRadius.small};
`;

const oxAnswerStyle = (theme: Theme) => css`
  font-size: ${theme.typography['16Bold'].fontSize};
  font-weight: ${theme.typography['16Bold'].fontWeight};
  color: ${theme.colors.text.strong};
  padding: 8px 12px;
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.small};
`;

const matchingAnswerContainerStyle = css`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const matchingAnswerListStyle = css`
  display: flex;
  flex-direction: column;
  gap: 4px;
  list-style: none;
  padding: 0;
  margin: 0;
`;

const matchingAnswerItemStyle = (theme: Theme) => css`
  background: ${theme.colors.surface.strong};
  border-radius: ${theme.borderRadius.small};
  padding: 8px 12px;
  font-size: ${theme.typography['16Medium'].fontSize};
  line-height: ${theme.typography['16Medium'].lineHeight};
  color: ${theme.colors.text.default};
`;
