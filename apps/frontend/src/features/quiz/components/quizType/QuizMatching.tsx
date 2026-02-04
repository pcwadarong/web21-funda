import { css } from '@emotion/react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { MatchingLine } from '@/feat/quiz/components/quizOptions/MatchingLine';
import { QuizMatchingOption } from '@/feat/quiz/components/quizOptions/QuizMatchingOption';
import type {
  MatchingContent,
  MatchingItem,
  MatchingPair,
  QuizComponentProps,
} from '@/feat/quiz/types';

/**
 * 매칭(연결형) 퀴즈 컴포넌트
 * 좌측과 우측의 항목을 선택하여 올바른 쌍을 만드는 로직을 담당합니다
 */
export const QuizMatching = ({
  content,
  selectedAnswer,
  correctAnswer,
  onAnswerChange,
  showResult,
  disabled = false,
}: QuizComponentProps) => {
  const { matching_metadata } = content as MatchingContent;

  /** 모든 버튼의 Ref를 담을 저장소 (인덱스 기반 키) */
  const optionRefs = useRef<Map<string, HTMLButtonElement>>(new Map());

  /** 전체를 감싸는 부모 컨테이너의 Ref */
  const containerRef = useRef<HTMLDivElement>(null);
  const isMountedRef = useRef(true);

  /** SVG 라인 재계산을 위한 트리거 상태 */
  const [lineUpdateTrigger, setLineUpdateTrigger] = useState(0);

  /** 사용자가 현재까지 완성한 매칭 쌍 목록 (id 기반) */
  const currentPairs = (selectedAnswer as { pairs: MatchingPair[] })?.pairs || [];

  /** 서버에서 받은 정답 쌍 목록 (id 기반) */
  const correctPairs: MatchingPair[] = useMemo(() => {
    if (!correctAnswer || typeof correctAnswer !== 'object' || !('pairs' in correctAnswer)) {
      return [];
    }

    return (correctAnswer as { pairs: MatchingPair[] }).pairs || [];
  }, [correctAnswer]);

  /** 사용자가 매칭을 위해 클릭한 임시 선택 상태 (인덱스 기반) */
  const [activeSelection, setActiveSelection] = useState<{
    leftIndex: number | null;
    rightIndex: number | null;
  }>({ leftIndex: null, rightIndex: null });

  /** 렌더링 시 각 옵션에 Ref를 할당하는 함수 (id 기반 키) */
  const setRef = (side: 'left' | 'right', itemId: string) => (el: HTMLButtonElement | null) => {
    const key = `${side}-${itemId}`;
    if (el) optionRefs.current.set(key, el);
    else optionRefs.current.delete(key);
  };

  const getItemByIndex = (side: 'left' | 'right', index: number): MatchingItem | null => {
    const item = matching_metadata[side][index];
    return item ?? null;
  };

  /** 특정 인덱스의 항목이 이미 매칭 완료 상태인지 확인 */
  const findPairByIndex = (side: 'left' | 'right', index: number) => {
    const item = getItemByIndex(side, index);
    if (!item) {
      return undefined;
    }

    return side === 'left'
      ? currentPairs.find(pair => pair.left === item.id)
      : currentPairs.find(pair => pair.right === item.id);
  };

  /** 정답 확인 시, 해당 항목이 올바르게 매칭되었는지 여부를 판단합니다. */
  const checkIsCorrect = (side: 'left' | 'right', index: number) => {
    if (!showResult || correctPairs.length === 0) return false;

    const userPair = findPairByIndex(side, index);
    if (!userPair) return false;

    return correctPairs.some(
      correct => correct.left === userPair.left && correct.right === userPair.right,
    );
  };

  /**
   * 항목 클릭 핸들러: 매칭 생성, 취소 및 임시 선택을 관리합니다.
   * 중복 매칭 방지: 이미 매칭된 항목을 다시 매칭하면 기존 매칭이 해제되고 새로운 매칭으로 교체됩니다.
   */
  const handleOptionClick = (side: 'left' | 'right', index: number) => {
    if (disabled || showResult) return;

    const oppositeSide = side === 'left' ? 'right' : 'left';
    const oppositeIndexKey = side === 'left' ? 'rightIndex' : 'leftIndex';
    const waitingIndex = activeSelection[oppositeIndexKey];

    // 이미 매칭된 항목 클릭 시: 해당 매칭 해제 (취소)
    const existingPair = findPairByIndex(side, index);
    if (existingPair) {
      const currentItem = getItemByIndex(side, index);
      if (!currentItem) {
        return;
      }

      const filteredPairs =
        side === 'left'
          ? currentPairs.filter(pair => pair.left !== currentItem.id)
          : currentPairs.filter(pair => pair.right !== currentItem.id);

      onAnswerChange({ pairs: filteredPairs });
      setActiveSelection({ leftIndex: null, rightIndex: null });
      return;
    }

    // 반대편에 대기 중인 선택이 있다면: 새로운 쌍 결합
    if (waitingIndex !== null) {
      const currentItem = getItemByIndex(side, index);
      const oppositeItem = getItemByIndex(oppositeSide, waitingIndex);
      if (!currentItem || !oppositeItem) {
        setActiveSelection({ leftIndex: null, rightIndex: null });
        return;
      }

      // 중복 매칭 방지: 현재 항목과 반대편 항목 모두 기존 매칭이 있다면 해제
      const currentExistingPair = findPairByIndex(side, index);
      const oppositeExistingPair = findPairByIndex(oppositeSide, waitingIndex);

      let pairsWithoutBoth = currentPairs;
      if (currentExistingPair) {
        pairsWithoutBoth =
          side === 'left'
            ? pairsWithoutBoth.filter(pair => pair.left !== currentItem.id)
            : pairsWithoutBoth.filter(pair => pair.right !== currentItem.id);
      }

      if (oppositeExistingPair) {
        pairsWithoutBoth =
          side === 'left'
            ? pairsWithoutBoth.filter(pair => pair.right !== oppositeItem.id)
            : pairsWithoutBoth.filter(pair => pair.left !== oppositeItem.id);
      }

      const newPair =
        side === 'left'
          ? { left: currentItem.id, right: oppositeItem.id }
          : { left: oppositeItem.id, right: currentItem.id };

      onAnswerChange({ pairs: [...pairsWithoutBoth, newPair] });
      setActiveSelection({ leftIndex: null, rightIndex: null });
    } else {
      // 반대편이 비어있다면: 현재 항목 임시 선택 (토글 가능)
      const selectionKey = side === 'left' ? 'leftIndex' : 'rightIndex';
      setActiveSelection(prev => ({
        ...prev,
        [selectionKey]: prev[selectionKey] === index ? null : index,
      }));
    }
  };

  /**
   * 좌/우 컬럼의 선택지들을 렌더링하는 공통 함수
   */
  const renderColumn = (side: 'left' | 'right') => (
    <div css={columnStyle}>
      {matching_metadata[side].map((item, index) => {
        const isAlreadyPaired = !!findPairByIndex(side, index);
        const selectionKey = side === 'left' ? 'leftIndex' : 'rightIndex';
        const isWaiting = activeSelection[selectionKey] === index;
        const isCorrect = checkIsCorrect(side, index);
        const isWrong = showResult && isAlreadyPaired && !isCorrect;

        return (
          <QuizMatchingOption
            ref={setRef(side, item.id)}
            key={`${side}-${item.id}`}
            option={item.text}
            isMatched={isAlreadyPaired}
            isSelected={isWaiting}
            onClick={() => handleOptionClick(side, index)}
            disabled={disabled}
            isCorrect={isCorrect}
            isWrong={isWrong}
          />
        );
      })}
    </div>
  );

  // 리사이즈 감지 및 SVG 라인 재계산
  const shouldObserveLines = showResult || currentPairs.length > 0;

  useEffect(() => {
    isMountedRef.current = true;
    if (!shouldObserveLines || !containerRef.current) return;

    // ResizeObserver가 사용 가능한지 확인
    if (typeof ResizeObserver === 'undefined') return;

    const resizeObserver = new ResizeObserver(() => {
      if (!isMountedRef.current) {
        return;
      }

      setLineUpdateTrigger(prev => prev + 1);
    });

    resizeObserver.observe(containerRef.current);

    // 모든 옵션 버튼도 관찰
    optionRefs.current.forEach(button => {
      resizeObserver.observe(button);
    });

    return () => {
      isMountedRef.current = false;
      resizeObserver.disconnect();
    };
  }, [showResult, currentPairs.length, shouldObserveLines]);

  return (
    <div css={matchingWrapperStyle} ref={containerRef}>
      {renderColumn('left')}
      {renderColumn('right')}

      {!showResult && currentPairs.length > 0 && (
        <svg css={svgOverlayStyle} key={`user-${lineUpdateTrigger}`}>
          {currentPairs.map((pair, index) => {
            const startEl = optionRefs.current.get(`left-${pair.left}`);
            const endEl = optionRefs.current.get(`right-${pair.right}`);

            if (!startEl || !endEl || !containerRef.current) return null;

            return (
              <MatchingLine
                key={`${pair.left}-${pair.right}-${index}`}
                startEl={startEl}
                endEl={endEl}
                containerEl={containerRef.current}
                variant="neutral"
              />
            );
          })}
        </svg>
      )}

      {showResult && correctPairs.length > 0 && (
        <svg css={svgOverlayStyle} key={lineUpdateTrigger}>
          {correctPairs.map((correctPair, index) => {
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
                variant={isUserCorrect ? 'correct' : 'wrong'}
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
