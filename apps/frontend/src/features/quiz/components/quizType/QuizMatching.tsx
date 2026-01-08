import { css } from '@emotion/react';
import { useMemo, useState } from 'react';

import { QuizMatchingOption } from '@/feat/quiz/components/quizOptions/QuizMatchingOption';
import type { MatchingContent, MatchingPair, QuizComponentProps } from '@/feat/quiz/types';

/**
 * 매칭(연결형) 퀴즈 컴포넌트
 * 좌측과 우측의 항목을 선택하여 올바른 쌍을 만드는 로직을 담당합니다
 */
export const QuizMatching = ({
  content,
  selectedAnswer,
  onAnswerChange,
  showResult,
  disabled = false,
}: QuizComponentProps) => {
  const { matching_metadata } = content as MatchingContent;

  /** @type {MatchingPair[]} 사용자가 현재까지 완성한 매칭 쌍 목록 */
  const currentPairs = (selectedAnswer as { pairs: MatchingPair[] })?.pairs || [];

  // TODO: 실제 API 데이터의 answer 필드와 매칭 필요
  const mockCorrectPairs: MatchingPair[] = useMemo(
    () => [
      { left: 'div p', right: 'div의 모든 자손 p' },
      { left: 'div > p', right: 'div의 직계 자식 p' },
      { left: 'h1 + p', right: 'h1 바로 다음 p' },
      { left: 'h1 ~ p', right: 'h1 뒤의 모든 형제 p' },
    ],
    [],
  );

  /** @type {Object} 사용자가 매칭을 위해 클릭한 임시 선택 상태 */
  const [activeSelection, setActiveSelection] = useState<{
    left: string | null;
    right: string | null;
  }>({ left: null, right: null });

  /**
   * 특정 항목이 이미 매칭 완료 상태인지 확인
   * @param {'left' | 'right'} side 확인하려는 쪽
   * @param {string} value 확인하려는 항목의 텍스트 값
   */
  const findPairByValue = (side: 'left' | 'right', value: string) =>
    currentPairs.find(p => p[side] === value);

  /**
   * 정답 확인 시, 해당 항목이 올바르게 매칭되었는지 여부를 판단합니다.
   * @param {'left' | 'right'} side
   * @param {string} value
   * @returns {boolean} 정답 여부
   */
  const checkIsCorrect = (side: 'left' | 'right', value: string) => {
    if (!showResult) return false;

    const userPair = findPairByValue(side, value);
    if (!userPair) return false;

    // 현재 쌍이 정답 목록(mockCorrectPairs)에 존재하는지 단순 비교
    return mockCorrectPairs.some(
      correct => correct.left === userPair.left && correct.right === userPair.right,
    );
  };

  /**
   * 항목 클릭 핸들러: 매칭 생성, 취소 및 임시 선택을 관리합니다.
   * @param {'left' | 'right'} side 클릭한 쪽
   * @param {string} value 클릭한 항목 값
   */
  const handleOptionClick = (side: 'left' | 'right', value: string) => {
    if (disabled || showResult) return;

    // 이미 매칭된 항목 클릭 시: 해당 매칭 해제 (취소)
    const existingPair = findPairByValue(side, value);
    if (existingPair) {
      onAnswerChange({ pairs: currentPairs.filter(p => p[side] !== value) });
      return;
    }

    const oppositeSide = side === 'left' ? 'right' : 'left';
    const waitingValue = activeSelection[oppositeSide];

    // 반대편에 대기 중인 선택이 있다면: 새로운 쌍 결합
    if (waitingValue) {
      const newPair =
        side === 'left'
          ? { left: value, right: waitingValue }
          : { left: waitingValue, right: value };

      onAnswerChange({ pairs: [...currentPairs, newPair] });
      setActiveSelection({ left: null, right: null });
    }
    // 3. 반대편이 비어있다면: 현재 항목 임시 선택 (토글 가능)
    else {
      setActiveSelection(prev => ({
        ...prev,
        [side]: prev[side] === value ? null : value,
      }));
    }
  };

  /**
   * 좌/우 컬럼의 선택지들을 렌더링하는 공통 함수
   * @param {'left' | 'right'} side 렌더링할 쪽
   */
  const renderColumn = (side: 'left' | 'right') => (
    <div css={columnStyle}>
      {matching_metadata[side].map(item => {
        const isAlreadyPaired = !!findPairByValue(side, item);
        const isWaiting = activeSelection[side] === item;
        const isCorrect = checkIsCorrect(side, item);
        const isWrong = showResult && isAlreadyPaired && !isCorrect;

        return (
          <QuizMatchingOption
            key={item}
            option={item}
            isMatched={isAlreadyPaired} // 이미 짝이 지어짐 (연하게 표시용)
            isSelected={isWaiting} // 지금 클릭함 (강조 표시용)
            onClick={() => handleOptionClick(side, item)}
            disabled={disabled}
            isCorrect={isCorrect}
            isWrong={isWrong}
          />
        );
      })}
    </div>
  );

  return (
    <div css={matchingWrapperStyle}>
      {renderColumn('left')}
      {renderColumn('right')}
    </div>
  );
};

const matchingWrapperStyle = css`
  display: flex;
  justify-content: space-between;
  gap: 24px;
  width: 100%;
  margin-top: 24px;
`;

const columnStyle = css`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
