import { css } from '@emotion/react';
import React from 'react';

import SVGIcon from '@/comp/SVGIcon';

import {
  fadeUp,
  scrollRevealStyle,
  scrollRevealVisibleStyle,
  sectionHeaderStyle,
  sectionInnerStyle,
  sectionSubtitleStyle,
  sectionTitleAccentStyle,
  sectionTitleStyle,
  useScrollReveal,
} from './styles';

const reviewScores = [
  { value: 0, emoji: '😭', borderColor: '#FFA2A2', color: '#C10007', backgroundColor: '#FFE2E2' },
  { value: 1, emoji: '😢', borderColor: '#FFB86A', color: '#CA3500', backgroundColor: '#FFEDD4' },
  { value: 2, emoji: '😐', borderColor: '#FFDF20', color: '#A65F00', backgroundColor: '#FEF9C2' },
  { value: 3, emoji: '🙂', borderColor: '#BBF451', color: '#497D00', backgroundColor: '#ECFCCA' },
  { value: 4, emoji: '😊', borderColor: '#7BF1A8', color: '#008236', backgroundColor: '#DCFCE7' },
  {
    value: 5,
    emoji: '😍',
    borderColor: '#6559EA',
    color: '#6559EA',
    backgroundColor: '#6559EA1A',
  },
];

export const ReviewSection = React.memo(() => {
  const reviewHeaderReveal = useScrollReveal<HTMLDivElement>();
  const reviewGraphReveal = useScrollReveal<HTMLDivElement>();
  const reviewPillReveal = useScrollReveal<HTMLDivElement>();
  const reviewListReveal = useScrollReveal<HTMLDivElement>();

  return (
    <section css={reviewSectionStyle}>
      <div css={sectionInnerStyle}>
        <div
          ref={reviewHeaderReveal.ref}
          css={[
            sectionHeaderStyle,
            scrollRevealStyle,
            reviewHeaderReveal.revealed && scrollRevealVisibleStyle,
          ]}
        >
          <h2 css={sectionTitleStyle}>
            머리가 아닌 입에 붙을 때까지,
            <br />
            <span css={sectionTitleAccentStyle}>끈질긴 복습 시스템</span>
          </h2>
          <p css={sectionSubtitleStyle}>
            배운 표현이 영구적으로 기억될 수 있도록,
            <br />
            펀다만의 간격 반복(Spaced Repetition) 알고리즘이 최적의 타이밍을 계산합니다.
          </p>
        </div>

        <div
          ref={reviewGraphReveal.ref}
          css={[
            graphRowStyle,
            scrollRevealStyle,
            reviewGraphReveal.revealed && scrollRevealVisibleStyle,
          ]}
        >
          <div css={graphCardStyle}>
            <div css={graphHeaderStyle}>
              <div css={graphTitleStyle}>
                <SVGIcon icon="Brain" size="sm" />
                <span>일반적인 학습</span>
              </div>
              <span css={graphTagStyle}>급격한 망각</span>
            </div>
            <div css={graphFrameStyle}>
              <div css={graphInnerFrameStyle}>
                <SVGIcon icon="GraphDown" css={graphSvgStyle} />
              </div>
              <span css={[graphAxisStyle, graphAxisTopStyle]}>100%</span>
              <span css={[graphAxisStyle, graphAxisBottomStyle]}>0%</span>
              <span css={[graphAxisStyle, graphLabelStyle]}>시간</span>
            </div>
          </div>
          <div css={graphArrowStyle} aria-hidden="true">
            →
          </div>
          <div css={[graphCardStyle, graphCardActiveStyle]}>
            <div css={graphHeaderActiveStyle}>
              <div css={graphTitleActiveStyle}>
                <SVGIcon icon="Lightning" size="sm" />
                <span>Funda 복습 시스템</span>
              </div>
              <span css={[graphTagStyle, graphActiveTagStyle]}>영구 기억화</span>
            </div>
            <div css={[graphFrameStyle, graphFrameActiveStyle]}>
              <div css={[graphInnerFrameStyle, graphInnerFrameActiveStyle]}>
                <SVGIcon icon="GraphUp" css={graphSvgStyle} />
              </div>
              <span css={[graphAxisStyle, graphAxisTopStyle, graphAxisTopActiveStyle]}>100%</span>
              <span css={[graphAxisStyle, graphAxisBottomStyle, graphAxisBottomActiveStyle]}>
                0%
              </span>
              <span css={[graphAxisStyle, graphLabelStyle, graphLabelActiveStyle]}>시간</span>
              <span css={graphMarkerStyle('86px', '125px')} />
              <span css={graphMarkerStyle('150px', '94px')} />
              <span css={graphMarkerStyle('214px', '60px')} />
              <span css={graphMarkerLabelStyle('76px', '121px')}>Day 1</span>
              <span css={graphMarkerLabelStyle('140px', '90px')}>Day 6</span>
              <span css={graphMarkerLabelStyle('204px', '56px')}>Day 14</span>
            </div>
          </div>
        </div>

        <div
          ref={reviewPillReveal.ref}
          css={[
            reviewPillStyle,
            scrollRevealStyle,
            reviewPillReveal.revealed && scrollRevealVisibleStyle,
          ]}
        >
          지금쯤 이 문제를 복습하기 최적의 타이밍이에요!
        </div>

        <div
          ref={reviewListReveal.ref}
          css={[
            reviewListCardStyle,
            scrollRevealStyle,
            reviewListReveal.revealed && scrollRevealVisibleStyle,
          ]}
        >
          <div css={reviewListHeaderStyle}>오늘의 복습 리스트</div>
          <div css={reviewListPanelStyle}>
            <div css={codeBlockStyle}>
              <code>
                <span>const result = array.</span>
                <span>_____(item =&gt; item &gt; 5)</span>
              </code>
            </div>
            <div css={reviewListQuestionStyle}>빈 칸에 들어갈 배열 메서드는?</div>
          </div>
          <div css={reviewListHintStyle}>이 개념을 얼마나 잘 기억하고 있나요?</div>
          <div css={reviewScoreRowStyle}>
            {reviewScores.map(score => (
              <div
                key={score.value}
                css={reviewScoreItemStyle(score.color, score.borderColor, score.backgroundColor)}
              >
                <div css={reviewScoreEmojiStyle}>{score.emoji}</div>
                <div css={reviewScoreValueStyle}>{score.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
});

const reviewSectionStyle = css`
  padding: 120px 24px;
  background: linear-gradient(180deg, #f7f7fc 0%, #eff0f6 100%);
`;

const graphRowStyle = css`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  flex-wrap: wrap;
  margin-bottom: 60px;
`;

const graphTitleStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #6a7282;
`;

const graphCardStyle = css`
  width: min(380px, 90vw);
  background: #f9fafb;
  border-radius: 24px;
  padding: 24px;
  border: 2px solid #d9dbe9;
  animation: ${fadeUp} 700ms ease-out;
  display: flex;
  flex-direction: column;
  gap: 12px;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const graphCardActiveStyle = css`
  border-color: #a29aff;
  background: linear-gradient(135deg, rgba(101, 89, 234, 0.1) 0%, rgba(162, 154, 255, 0.1) 100%);
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.1);
  color: #fefefe;
`;

const graphHeaderStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.75rem;
  font-weight: 500;
`;

const graphHeaderActiveStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
  color: #fefefe;
`;

const graphTitleActiveStyle = css`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 1rem;
  color: #6559ea;
`;

const graphTagStyle = css`
  padding: 4px 10px;
  border-radius: 999px;
  background: #fefefe;
  border: 1px solid #e5e7eb;
  color: #6a7282;
  font-size: 0.75rem;
`;

const graphActiveTagStyle = css`
  color: #6559ea;
  border-color: #6559ea;
`;

const graphFrameStyle = css`
  position: relative;
  background: #fefefe;
  border-radius: 24px;
  padding: 36px 42px;
  border: 1px solid #e5e7eb;
`;

const graphInnerFrameStyle = css`
  height: 145px;
  padding-top: 15px;
  border-left: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
`;

const graphInnerFrameActiveStyle = css`
  padding-top: 0;
  padding-bottom: 15px;
`;

const graphFrameActiveStyle = css`
  background: #fefefe;
  border: 1px solid rgba(255, 255, 255, 0.7);
  width: 100%;
  border: 1px solid #e5e7eb;
`;

const graphSvgStyle = css`
  width: 100% !important;
  height: 100% !important;
  display: block;
`;

const graphAxisStyle = css`
  position: absolute;
  font-size: 0.75rem;
  color: #6e7191;
`;

const graphAxisTopStyle = css`
  left: 48px;
  top: 32px;
`;

const graphAxisBottomStyle = css`
  left: 50px;
  bottom: 40px;
`;

const graphLabelStyle = css`
  right: 40px;
  bottom: 14px;
`;

const graphAxisTopActiveStyle = css`
  font-size: 0.75rem;
  color: #6559ea;
`;

const graphAxisBottomActiveStyle = css`
  font-size: 0.75rem;
  color: #6559ea;
`;

const graphLabelActiveStyle = css`
  font-size: 0.75rem;
  color: #6559ea;
`;

const graphMarkerStyle = (left: string, top: string) => css`
  position: absolute;
  left: ${left};
  top: ${top};
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background: #23c55e;
  border: 2px solid #fefefe;
`;

const graphMarkerLabelStyle = (left: string, top: string) => css`
  position: absolute;
  left: ${left};
  top: ${top};
  font-size: 0.75rem;
  color: #6559ea;
  transform: translateY(-14px);
`;

const graphArrowStyle = css`
  font-size: 1.5rem;
  color: #6559ea;
  padding: 4px 10px;
`;

const reviewPillStyle = css`
  margin: 28px auto 32px;
  width: fit-content;
  padding: 12px 60px;
  border-radius: 16px;
  background: #d1cef9;
  color: #4a3fb8;
  font-weight: 500;
  font-size: 0.75rem;
  position: relative;
  box-shadow: 0 12px 24px rgba(20, 20, 43, 0.1);
  text-align: center;

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    transform: translateX(-50%);
    bottom: -8px;
    border-width: 8px 8px 0 8px;
    border-style: solid;
    border-color: #d1cef9 transparent transparent transparent;
    box-shadow: 0 12px 24px rgba(20, 20, 43, 0.1);
  }
`;

const reviewListCardStyle = css`
  max-width: 540px;
  margin: 0 auto;
  background: #fefefe;
  border-radius: 24px;
  padding: 24px;
  border: 1px solid #d9dbe9;
  box-shadow: 0 14px 30px rgba(20, 20, 43, 0.12);
  text-align: center;
  animation: ${fadeUp} 650ms ease-out;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
  }
`;

const reviewListHeaderStyle = css`
  font-size: 1rem;
  font-weight: 700;
  color: #6559ea;
  margin-bottom: 24px;
`;

const reviewListPanelStyle = css`
  background: #f7f7fc;
  border-radius: 24px;
  border: 1px solid #d9dbe9;
  padding: 16px;
  margin-bottom: 24px;
`;

const codeBlockStyle = css`
  background: #14142b;
  color: #fefefe;
  border-radius: 16px;
  padding: 18px 16px;
  font-family: 'D2Coding', monospace;
  font-size: 0.75rem;
  margin-bottom: 12px;
  text-align: left;

  code {
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  code > span:nth-child(1) {
    color: #05df72;
  }

  code > span:nth-child(2) {
    color: #ffdf20;
  }
`;

const reviewListQuestionStyle = css`
  font-size: 0.75rem;
  color: #4e4b66;
  text-align: left;
`;

const reviewListHintStyle = css`
  font-size: 0.75rem;
  color: #6e7191;
  margin-bottom: 16px;
  text-align: center;
`;

const reviewScoreRowStyle = css`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 540px) {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
`;

const reviewScoreItemStyle = (color: string, borderColor: string, backgroundColor: string) => css`
  height: 80px;
  color: ${color};
  background-color: ${backgroundColor};
  border-radius: 16px;
  border: 2px solid ${borderColor};
  padding: 10px 6px;
  text-align: center;
  box-shadow: 0 10px 18px rgba(20, 20, 43, 0.12);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6px;
`;

const reviewScoreEmojiStyle = css`
  font-size: 18px;
  line-height: 1.2;
`;

const reviewScoreValueStyle = css`
  margin-top: 6px;
  font-size: 0.75rem;
  font-weight: 500;
`;
