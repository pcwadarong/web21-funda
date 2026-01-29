import { css } from '@emotion/react';
import React from 'react';

import {
  scrollRevealStyle,
  scrollRevealVisibleStyle,
  sectionHeaderStyle,
  sectionInnerStyle,
  sectionTitleStyle,
  useScrollReveal,
} from './styles';

const needsList = [
  'CS 기초가 부족해 기술 면접이 두려운 주니어 개발자',
  '체계적인 로드맵을 따라 학습하고 싶은 초보자',
  '출퇴근 길 5분, 틈틈이 실력을 쌓고 싶은 효율 중시 개발자',
  '지루한 강의보다 인터랙티브한 퀴즈로 체득하고 싶은 분',
];

export const NeedsSection = React.memo(() => {
  const needsHeaderReveal = useScrollReveal<HTMLDivElement>();
  const needsItemReveals = [
    useScrollReveal<HTMLLIElement>(),
    useScrollReveal<HTMLLIElement>(),
    useScrollReveal<HTMLLIElement>(),
    useScrollReveal<HTMLLIElement>(),
  ];

  return (
    <section css={needsSectionStyle}>
      <div css={sectionInnerStyle}>
        <div
          ref={needsHeaderReveal.ref}
          css={[
            sectionHeaderStyle,
            scrollRevealStyle,
            needsHeaderReveal.revealed && scrollRevealVisibleStyle,
          ]}
        >
          <h2 css={sectionTitleStyle}>이런 분들께 펀다가 필요합니다</h2>
        </div>
        <ul css={needsListStyle}>
          {needsList.map((item, index) => (
            <li
              key={item}
              ref={needsItemReveals[index]?.ref}
              css={[
                needsItemStyle,
                scrollRevealStyle,
                needsItemReveals[index]?.revealed && scrollRevealVisibleStyle,
              ]}
            >
              <span css={checkBadgeStyle}>✓</span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
});

const needsSectionStyle = css`
  padding: 110px 24px;
  background: #eff0f6;
`;

const needsListStyle = css`
  width: min(450px, 80vw);
  display: grid;
  gap: 16px;
  margin: 0;
  padding: 0;
  max-width: 720px;
  margin-inline: auto;
`;

const needsItemStyle = css`
  list-style: none;
  background: #fefefe;
  border-radius: 16px;
  padding: 14px 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  box-shadow: 0 10px 20px rgba(20, 20, 43, 0.1);
  font-size: 1rem;
  color: #14142b;
`;

const checkBadgeStyle = css`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: #a29aff;
  color: #fefefe;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font-size: 0.75rem;
  font-weight: 500;
`;
