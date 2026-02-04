import { css } from '@emotion/react';

import { Button } from '@/components/Button';

export interface UnsubscribeContainerProps {
  email: string | null;
  onUnsubscribe: () => void;
  isLoading: boolean;
}

export function UnsubscribeContainer({
  email,
  onUnsubscribe,
  isLoading,
}: UnsubscribeContainerProps) {
  return (
    <section css={containerStyle} aria-label="이메일 수신 거부">
      <h2>이메일 수신 거부</h2>
      <p>
        대상: <strong>{email ?? '이메일 정보 없음'}</strong>
      </p>
      <p>앞으로 Funda의 리마인드 퀴즈 메일을 받지 않으시겠습니까?</p>
      <Button onClick={onUnsubscribe} variant="primary" disabled={isLoading}>
        {isLoading ? '처리 중...' : '수신 거부하기'}
      </Button>
    </section>
  );
}

const containerStyle = css`
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0 24px;
  width: 100%;
  text-align: center;
  word-break: keep-all;

  h2 {
    margin-bottom: 1.5rem;
  }

  p:last-of-type {
    margin: 0 0 2rem;
  }
`;
