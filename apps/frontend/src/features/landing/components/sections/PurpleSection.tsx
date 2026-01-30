import { css } from '@emotion/react';
import React from 'react';

import GrassImage from '@/assets/landing-icons/grass.png';
import QuizImage from '@/assets/landing-icons/quiz.png';
import RankingImage from '@/assets/landing-icons/ranking.png';

import {
  scrollRevealStyle,
  scrollRevealVisibleStyle,
  sectionHeaderStyle,
  sectionInnerStyle,
  slideDelayStyle,
  slideFromRightStyle,
  slideFromRightVisibleStyle,
  useScrollReveal,
} from './styles';

const featureCards = [
  { title: '가벼운 퀴즈', image: QuizImage, alt: 'quiz example image' },
  { title: '랭킹 1위 달성', image: RankingImage, alt: 'ranking example image' },
  { title: '매일 매일 심는 잔디', image: GrassImage, alt: 'grass example image' },
];

export const PurpleSection = React.memo(() => {
  const purpleReveal = useScrollReveal<HTMLDivElement>();
  const featureCardReveals = [
    useScrollReveal<HTMLDivElement>(),
    useScrollReveal<HTMLDivElement>(),
    useScrollReveal<HTMLDivElement>(),
  ];

  return (
    <section css={purpleSectionStyle}>
      <div
        ref={purpleReveal.ref}
        css={[
          sectionInnerStyle,
          scrollRevealStyle,
          purpleReveal.revealed && scrollRevealVisibleStyle,
        ]}
      >
        <div css={sectionHeaderStyle}>
          <h2 css={sectionTitleLightStyle}>
            언제 어디서나 부담없이
            <br />
            게임처럼 재미있게
          </h2>
        </div>
        <div css={featureCardRowStyle}>
          {featureCards.map((card, index) => (
            <div
              key={card.title}
              ref={featureCardReveals[index]?.ref}
              css={[
                featureCardStyle,
                slideFromRightStyle,
                slideDelayStyle(index),
                featureCardReveals[index]?.revealed && slideFromRightVisibleStyle,
              ]}
            >
              <div css={featureCardTitleStyle}>{card.title}</div>
              <div css={featureCardImageStyle}>
                <img src={card.image} alt={card.alt} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
});

const purpleSectionStyle = css`
  padding: 110px 24px 130px;
  background: linear-gradient(180deg, #6559ea 0%, #6559ea 80%, #eff0f6 100%);
  color: #fefefe;
`;

const sectionTitleLightStyle = css`
  margin: 0;
  font-size: clamp(24px, 3.2vw, 2rem);
  font-weight: 700;
`;

const featureCardRowStyle = css`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 18px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

const featureCardStyle = css`
  height: 310px;
  background: #f7f7fc;
  border-radius: 16px;
  padding: 18px;
  box-shadow: 0 16px 26px rgba(21, 21, 47, 0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  min-height: 180px;
`;

const featureCardTitleStyle = css`
  font-size: 1rem;
  color: #4a5565;
`;

const featureCardImageStyle = css`
  height: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
`;
