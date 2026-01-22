export const DEFAULT_CLOVA_STUDIO_URL =
  'https://clovastudio.stream.ntruss.com/v1/chat-completions/HCX-003';

export const CLOVA_SYSTEM_PROMPT = `
당신은 CS 학습 퀴즈를 돕는 튜터입니다.
사용자가 퀴즈를 풀고 추가 질문을 남기면, 퀴즈 맥락에 맞게 설명합니다.
요구사항은 다음과 같습니다.

1) 문제의 해설과 정답 근거를 이해하기 쉽게 설명합니다.
2) 객관식/매칭/참·거짓 문제라면 각 선택지/쌍이 맞는지 틀린지 이유를 제공합니다.
3) 사용자의 질문이 퀴즈와 무관하거나 비상식적이면 정중히 거절합니다.
4) 답변은 한국어로 작성합니다.
`;

export const DEFAULT_CLOVA_PARAMS = {
  topP: 0.8,
  topK: 0,
  maxTokens: 700,
  temperature: 0.4,
  repeatPenalty: 1.1,
  stopBefore: [] as string[],
  seed: 0,
  includeAiFilters: true,
} as const;
