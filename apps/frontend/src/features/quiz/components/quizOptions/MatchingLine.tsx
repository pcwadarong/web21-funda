import { useEffect, useLayoutEffect, useState } from 'react';

interface MatchingLineProps {
  /** 시작점(좌측) 버튼의 DOM 요소 */
  startEl: HTMLButtonElement;
  /** 끝점(우측) 버튼의 DOM 요소 */
  endEl: HTMLButtonElement;
  /** 기준이 되는 부모 컨테이너 DOM 요소 */
  containerEl: HTMLDivElement;
  /** 정답 여부에 따른 선의 색상 결정 */
  isCorrect: boolean;
}

/**
 * 두 선택지 사이의 연결선을 계산하여 SVG Line으로 렌더링
 */
export const MatchingLine = ({ startEl, endEl, containerEl, isCorrect }: MatchingLineProps) => {
  const [coords, setCoords] = useState({ x1: 0, y1: 0, x2: 0, y2: 0 });

  /** getBoundingClientRect를 사용하여 실시간 좌표를 계산 */
  const updateCoords = () => {
    // 각 요소의 절대 좌표 가져오기
    const startRect = startEl.getBoundingClientRect();
    const endRect = endEl.getBoundingClientRect();
    const containerRect = containerEl.getBoundingClientRect();

    /** 부모 컨테이너를 기준으로 상대 좌표 계산
     * 시작점: 왼쪽 버튼의 오른쪽 끝 중앙
     * 끝점: 오른쪽 버튼의 왼쪽 끝 중앙 */
    setCoords({
      x1: startRect.right - containerRect.left,
      y1: startRect.top + startRect.height / 2 - containerRect.top,
      x2: endRect.left - containerRect.left,
      y2: endRect.top + endRect.height / 2 - containerRect.top,
    });
  };

  // DOM 배치 직후 동기적으로 좌표를 계산하여 떨림을 방지
  useLayoutEffect(() => {
    updateCoords();
  }, [startEl, endEl, containerEl]);

  // 리사이즈 시에도 선의 위치를 재조정
  useEffect(() => {
    window.addEventListener('resize', updateCoords);
    return () => window.removeEventListener('resize', updateCoords);
  }, []);

  return (
    <line
      x1={coords.x1}
      y1={coords.y1}
      x2={coords.x2}
      y2={coords.y2}
      stroke={isCorrect ? '#4CAF50' : '#F44336'}
      strokeWidth="2"
      strokeDasharray={isCorrect ? '0' : '5,5'}
      style={{ transition: 'stroke 0.3s ease' }}
    />
  );
};
