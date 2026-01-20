/**
 * 리마인드 메일에 사용될 제목과 내용 변주 목록
 */
export const REMIND_MAIL_VARIANTS = {
  SUBJECTS: [
    (name: string) => `${name}님, 오늘 퀴즈 한 번 풀어볼까요? 🔥`,
    (name: string) => `잊으신 건 아니죠? ${name}님의 공부 불꽃을 지펴보세요! 🕯️`,
    (name: string) => `${name}님, 단 1분의 투자로 실력을 쌓아보세요! 🚀`,
    (name: string) => `기다리고 있었어요, ${name}님! 오늘 코딩 한 조각 어때요? 🧩`,
    (name: string) => `다시 시작하는 건 언제나 멋져요, ${name}님! 오늘의 퀴즈가 도착했습니다.`,
  ],
  CONTENTS: [
    '혹시 어려운 점이 있으셨나요?<br />오늘 단 하나의 퀴즈만 풀어도 연속 1일차가 시작됩니다!',
    '잠시 쉬어가고 계신가요?<br />가벼운 퀴즈 하나로 다시 학습 흐름을 타보세요. 저희가 도와드릴게요!',
    '꾸준함이 실력을 만듭니다.<br />지금 바로 접속해서 오늘의 도전 과제를 확인해보세요.',
  ],
};

/**
 * 리마인드 메일의 공통 HTML 레이아웃을 생성합니다.
 * @param name 유저 이름
 * @param content 메일 본문 문구
 * @param quizLink 퀴즈 페이지 링크
 * @param unsubscribeLink 수신 거부 링크
 */
export const getRemindMailHtml = (
  name: string,
  content: string,
  quizLink: string,
  unsubscribeLink: string,
) => {
  const safeName = name
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');

  return `
<div style="font-family: 'Apple SD Gothic Neo', 'Malgun Gothic', sans-serif; text-align: center; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee;">
  <h2 style="color: #6559EA;">안녕하세요, ${safeName}님!</h2>
  <p style="font-size: 16px; line-height: 1.6;">${content}</p>
  <div style="margin: 40px 0;">
    <a href="${quizLink}" 
       style="background: #6559EA; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
       지금 바로 퀴즈 풀기
    </a>
  </div>
  <hr style="border: 0; border-top: 1px solid #eee; margin: 40px 0;">
  <p style="font-size: 12px; color: #999;">
    본 메일은 수신 동의를 하신 분들께 발송됩니다.<br>
    더 이상 알림을 원하지 않으시면 <a href="${unsubscribeLink}" style="color: #999; text-decoration: underline;">수신 거부</a>를 눌러주세요.
  </p>
</div>
`;
};
