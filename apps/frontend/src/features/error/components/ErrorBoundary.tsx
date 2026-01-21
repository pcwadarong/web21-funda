import type { JSX } from 'react';
import * as React from 'react';

/**
 * 에러 바운더리 컴포넌트에 필요한 props 타입입니다.
 */
interface ErrorBoundaryProps {
  /** 오류 발생 시 렌더링할 대체 UI */
  fallback: JSX.Element;
  /** 정상 렌더링 시 표시할 자식 요소 */
  children: JSX.Element;
}

/**
 * 에러 바운더리의 내부 상태 타입입니다.
 */
interface ErrorBoundaryState {
  /** 오류 발생 여부 */
  hasError: boolean;
}

/**
 * 렌더링 중 발생한 오류를 감지해 지정된 fallback UI로 대체하는 에러 바운더리입니다.
 */
class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false };
  }

  /**
   * 하위 컴포넌트에서 오류가 발생하면 상태를 업데이트합니다.
   * @returns 오류 발생 여부를 상태로 설정한 결과
   */
  static getDerivedStateFromError() {
    return { hasError: true };
  }

  /**
   * 오류 정보 로깅을 위한 라이프사이클 메서드입니다.
   * @param error 발생한 오류 객체
   * @param errorInfo 오류 발생 위치 정보
   */
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo): void {
    console.error('Error caught by componentDidCatch:', error, errorInfo);
  }

  /**
   * 오류 발생 시 fallback UI를, 정상 시 자식을 렌더링합니다.
   * @returns 오류 발생 여부에 따른 React 엘리먼트
   */
  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
