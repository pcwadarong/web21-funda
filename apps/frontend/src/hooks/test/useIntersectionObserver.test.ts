import { act, cleanup, render, screen } from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import useIntersectionObserver from '@/hooks/useIntersectionObserver';

type ObserverCallback = (
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
) => void;

const observerOptions = { threshold: 0.1 };
const observeMock = vi.fn();
const unobserveMock = vi.fn();
let latestCallback: ObserverCallback | null = null;
let latestObserver: IntersectionObserver | null = null;

const buildEntry = (
  target: Element,
  isIntersecting: boolean,
  ratio = 0,
): IntersectionObserverEntry => {
  const rect: DOMRectReadOnly = {
    x: 0,
    y: 0,
    width: 0,
    height: 0,
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    toJSON: () => ({}),
  };

  return {
    boundingClientRect: rect,
    intersectionRatio: ratio,
    intersectionRect: rect,
    isIntersecting,
    rootBounds: null,
    target,
    time: 0,
  };
};

class MockIntersectionObserver {
  constructor(callback: ObserverCallback) {
    latestCallback = callback;
    latestObserver = this as unknown as IntersectionObserver;
  }

  observe = observeMock;
  unobserve = unobserveMock;
  disconnect = vi.fn();
  takeRecords = vi.fn();
}

const TestComponent = () => {
  const [targetRef, isVisible] = useIntersectionObserver<HTMLDivElement>(observerOptions);

  return React.createElement(
    'div',
    null,
    React.createElement('div', { ref: targetRef, 'data-testid': 'target' }),
    React.createElement('span', { 'data-testid': 'visible' }, isVisible ? '보임' : '안보임'),
  );
};

describe('useIntersectionObserver Hook', () => {
  beforeEach(() => {
    observeMock.mockClear();
    unobserveMock.mockClear();
    latestCallback = null;
    latestObserver = null;
    vi.stubGlobal('IntersectionObserver', MockIntersectionObserver);
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('관찰 대상이 뷰포트에 들어오면 isVisible이 true가 된다', () => {
    render(React.createElement(TestComponent));

    const target = screen.getByTestId('target');
    expect(observeMock).toHaveBeenCalledWith(target);
    expect(screen.getByTestId('visible')).toHaveTextContent('안보임');

    act(() => {
      latestCallback?.([buildEntry(target, true, 1)], latestObserver as IntersectionObserver);
    });

    expect(screen.getByTestId('visible')).toHaveTextContent('보임');
  });

  it('뷰포트에서 벗어나면 isVisible이 false로 변경된다', () => {
    render(React.createElement(TestComponent));

    const target = screen.getByTestId('target');

    act(() => {
      latestCallback?.([buildEntry(target, true, 1)], latestObserver as IntersectionObserver);
    });

    expect(screen.getByTestId('visible')).toHaveTextContent('보임');

    act(() => {
      latestCallback?.([buildEntry(target, false, 0)], latestObserver as IntersectionObserver);
    });

    expect(screen.getByTestId('visible')).toHaveTextContent('안보임');
  });

  it('관찰 이벤트가 비노출이면 isVisible이 false로 유지된다', () => {
    render(React.createElement(TestComponent));

    const target = screen.getByTestId('target');

    act(() => {
      latestCallback?.([buildEntry(target, false, 0)], latestObserver as IntersectionObserver);
    });

    expect(screen.getByTestId('visible')).toHaveTextContent('안보임');
  });

  it('여러 entry가 전달되면 첫 entry 기준으로 상태가 갱신된다', () => {
    render(React.createElement(TestComponent));

    const target = screen.getByTestId('target');

    act(() => {
      latestCallback?.(
        [buildEntry(target, false, 0), buildEntry(target, true, 1)],
        latestObserver as IntersectionObserver,
      );
    });

    expect(screen.getByTestId('visible')).toHaveTextContent('안보임');
  });
});
