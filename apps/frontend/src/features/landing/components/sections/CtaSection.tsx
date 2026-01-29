import { css } from '@emotion/react';
import React from 'react';

import { Button } from '@/comp/Button';

import {
  scrollRevealStyle,
  scrollRevealVisibleStyle,
  sectionInnerStyle,
  useScrollReveal,
} from './styles';

interface CtaSectionProps {
  onStart: () => void;
}

export const CtaSection = React.memo(({ onStart }: CtaSectionProps) => {
  const ctaReveal = useScrollReveal<HTMLDivElement>();

  return (
    <section css={ctaSectionStyle}>
      <div
        ref={ctaReveal.ref}
        css={[sectionInnerStyle, scrollRevealStyle, ctaReveal.revealed && scrollRevealVisibleStyle]}
      >
        <div css={ctaInnerStyle}>
          <h2 css={ctaTitleStyle}>
            지금 바로 시작해보세요.
            <br />첫 번째 퀴즈까지 단 10초면 충분합니다.
          </h2>
          <p css={ctaSubtitleStyle}>
            로그인 없이도 즉시 도전할 수 있습니다.
            <br />
            펀다의 모든 콘텐츠는 100% 무료로 제공됩니다.
            <br />
            나중에 로그인하면 오늘의 도전 기록을 안전하게 저장해 드릴게요.
          </p>
          <Button variant="secondary" onClick={onStart} css={ctaButtonStyle}>
            퀴즈 도전하기
          </Button>
        </div>
      </div>
    </section>
  );
});

const ctaSectionStyle = css`
  padding: 120px 24px 140px;
  background: linear-gradient(180deg, #6559ea 0%, #4a3fb8 100%);
  color: #fefefe;
`;

const ctaInnerStyle = css`
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

const ctaTitleStyle = css`
  margin: 0;
  font-size: clamp(24px, 4vw, 2.25rem);
  font-weight: 500;
`;

const ctaSubtitleStyle = css`
  margin: 0;
  font-size: 0.75rem;
  line-height: 1.5rem;
  color: rgba(245, 246, 255, 0.8);
`;

const ctaButtonStyle = css`
  margin-top: 18px;
  min-width: 180px;
  background: #fefefe;
  color: #4a3fb8;
`;
