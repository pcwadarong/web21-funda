import { css } from '@emotion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { MatchingLine } from '@/feat/quiz/components/quizOptions/MatchingLine';
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

  /** 모든 버튼의 Ref를 담을 저장소 */
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  /** 전체를 감싸는 부모 컨테이너의 Ref */
  const containerRef = useRef<HTMLDivElement>(null);

  /** SVG 라인 재계산을 위한 트리거 상태 */
  const [lineUpdateTrigger, setLineUpdateTrigger] = useState(0);

  /** 사용자가 현재까지 완성한 매칭 쌍 목록 */
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

  /** 사용자가 매칭을 위해 클릭한 임시 선택 상태 */
  const [activeSelection, setActiveSelection] = useState<{
    left: string | null;
    right: string | null;
  }>({ left: null, right: null });

  /** 렌더링 시 각 옵션에 Ref를 할당하는 함수 */
  const setRef = (side: 'left' | 'right', item: string) => (el: HTMLButtonElement | null) => {
    if (el) optionRefs.current.set(`${side}-${item}`, el);
    else optionRefs.current.delete(`${side}-${item}`);
  };

  /** 특정 항목이 이미 매칭 완료 상태인지 확인 */
  const findPairByValue = (side: 'left' | 'right', value: string) =>
    currentPairs.find(p => p[side] === value);

  /** 정답 확인 시, 해당 항목이 올바르게 매칭되었는지 여부를 판단합니다. */
  const checkIsCorrect = (side: 'left' | 'right', value: string) => {
    if (!showResult) return false;

    const userPair = findPairByValue(side, value);
    if (!userPair) return false;

    return mockCorrectPairs.some(
      correct => correct.left === userPair.left && correct.right === userPair.right,
    );
  };

  /**
   * 항목 클릭 핸들러: 매칭 생성, 취소 및 임시 선택을 관리합니다.
   * 중복 매칭 방지: 이미 매칭된 항목을 다시 매칭하면 기존 매칭이 해제되고 새로운 매칭으로 교체됩니다.
   */
  const handleOptionClick = (side: 'left' | 'right', value: string) => {
    if (disabled || showResult) return;

    const oppositeSide = side === 'left' ? 'right' : 'left';
    const waitingValue = activeSelection[oppositeSide];

    // 이미 매칭된 항목 클릭 시: 해당 매칭 해제 (취소)
    const existingPair = findPairByValue(side, value);
    if (existingPair) {
      onAnswerChange({ pairs: currentPairs.filter(p => p[side] !== value) });
      setActiveSelection({ left: null, right: null });
      return;
    }

    // 반대편에 대기 중인 선택이 있다면: 새로운 쌍 결합
    if (waitingValue) {
      // 중복 매칭 방지: 현재 항목과 반대편 항목 모두 기존 매칭이 있다면 해제
      const currentExistingPair = findPairByValue(side, value);
      const oppositeExistingPair = findPairByValue(oppositeSide, waitingValue);

      let pairsWithoutBoth = currentPairs;
      if (currentExistingPair) pairsWithoutBoth = pairsWithoutBoth.filter(p => p[side] !== value);

      if (oppositeExistingPair)
        pairsWithoutBoth = pairsWithoutBoth.filter(p => p[oppositeSide] !== waitingValue);

      const newPair =
        side === 'left'
          ? { left: value, right: waitingValue }
          : { left: waitingValue, right: value };

      onAnswerChange({ pairs: [...pairsWithoutBoth, newPair] });
      setActiveSelection({ left: null, right: null });
    } else {
      // 반대편이 비어있다면: 현재 항목 임시 선택 (토글 가능)
      setActiveSelection(prev => ({
        ...prev,
        [side]: prev[side] === value ? null : value,
      }));
    }
  };

  /**
   * 좌/우 컬럼의 선택지들을 렌더링하는 공통 함수
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
            ref={setRef(side, item)}
            key={item}
            option={item}
            isMatched={isAlreadyPaired}
            isSelected={isWaiting}
            onClick={() => handleOptionClick(side, item)}
            disabled={disabled}
            isCorrect={isCorrect}
            isWrong={isWrong}
          />
        );
      })}
    </div>
  );

  // 리사이즈 감지 및 SVG 라인 재계산
  useEffect(() => {
    if (!showResult || !containerRef.current) return;

    // ResizeObserver가 사용 가능한지 확인
    if (typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(() => {
      setLineUpdateTrigger(prev => prev + 1);
    });

    resizeObserver.observe(containerRef.current);

    // 모든 옵션 버튼도 관찰
    optionRefs.current.forEach(button => {
      resizeObserver.observe(button);
    });

    return () => {
      resizeObserver.disconnect();
    };
  }, [showResult, currentPairs.length]);

  return (
    <div css={matchingWrapperStyle} ref={containerRef}>
      {renderColumn('left')}
      {renderColumn('right')}

      {showResult && (
        <svg css={svgOverlayStyle} key={lineUpdateTrigger}>
          //TODO: API 데이터로 수정
          {mockCorrectPairs.map((correctPair, index) => {
            const isUserCorrect = currentPairs.some(
              userPair =>
                userPair.left === correctPair.left && userPair.right === correctPair.right,
            );

            const startEl = optionRefs.current.get(`left-${correctPair.left}`);
            const endEl = optionRefs.current.get(`right-${correctPair.right}`);

            if (!startEl || !endEl || !containerRef.current) return null;

            return (
              <MatchingLine
                key={`${correctPair.left}-${correctPair.right}-${index}`}
                startEl={startEl}
                endEl={endEl}
                containerEl={containerRef.current}
                isCorrect={isUserCorrect}
              />
            );
          })}
        </svg>
      )}
    </div>
  );
};

const matchingWrapperStyle = css`
  position: relative;
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

const svgOverlayStyle = css`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
`;
