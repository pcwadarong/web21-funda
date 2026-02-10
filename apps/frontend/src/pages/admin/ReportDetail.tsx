import { css, useTheme } from '@emotion/react';
import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';

import { Button } from '@/components/Button';
import { QuizRenderer } from '@/feat/quiz/components/QuizRenderer';
import type { CorrectAnswerType, MatchingPair, QuizQuestion, QuizType } from '@/feat/quiz/types';
import {
  type AdminQuizDetailResponse,
  type AdminQuizOption,
  adminService,
} from '@/services/adminService';
import { type ReportResponse, reportService } from '@/services/reportService';
import { useModal } from '@/store/modalStore';
import { useToast } from '@/store/toastStore';
import type { Theme } from '@/styles/theme';
import { TextWithCodeStyle } from '@/utils/textParser';

type TabKey = 'edit' | 'preview';

const toQuizType = (value: string): QuizType | null => {
  const normalized = value.trim().toLowerCase();
  if (
    normalized === 'mcq' ||
    normalized === 'ox' ||
    normalized === 'matching' ||
    normalized === 'code'
  ) {
    return normalized;
  }
  return null;
};

const toCleanString = (value: unknown): string | null => {
  if (typeof value === 'string') return value.trim();
  if (typeof value === 'number') return String(value).trim();
  return null;
};

const toPlainObject = (value: unknown): Record<string, unknown> | null =>
  typeof value === 'object' && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;

const extractCorrectAnswer = (quizType: QuizType, answer: unknown): CorrectAnswerType | null => {
  const obj = toPlainObject(answer);
  if (!obj) return null;

  if (quizType === 'matching') {
    const rawPairs =
      obj.pairs ?? obj.correct_pairs ?? obj.matching ?? obj.value ?? obj.correctPairs ?? null;
    if (!Array.isArray(rawPairs)) return { pairs: null };
    const pairs = rawPairs
      .map(pair => {
        const pairObj = toPlainObject(pair);
        if (!pairObj) return null;
        const left = toCleanString(pairObj.left);
        const right = toCleanString(pairObj.right);
        if (left && right) return { left, right };
        return null;
      })
      .filter((p): p is { left: string; right: string } => p !== null);

    return { pairs: pairs.length > 0 ? pairs : null };
  }

  const optionId = toCleanString(obj.value ?? obj.correct_option_id ?? obj.option_id);
  return optionId;
};

const normalizeOptions = (options: AdminQuizOption[] | undefined): AdminQuizOption[] => {
  if (!options) return [];
  return options
    .map(option => ({
      id: option.id.trim(),
      text: option.text.trim(),
    }))
    .filter(option => option.id.length > 0);
};

const toMatchingPairs = (answer: CorrectAnswerType | null): MatchingPair[] => {
  if (!answer || typeof answer !== 'object' || !('pairs' in answer)) return [];
  const pairs = (answer as { pairs: MatchingPair[] | null }).pairs;
  return Array.isArray(pairs) ? pairs : [];
};

const buildPairsKey = (pairs: MatchingPair[]): string =>
  [...pairs]
    .map(pair => ({ left: pair.left.trim(), right: pair.right.trim() }))
    .filter(pair => pair.left.length > 0 && pair.right.length > 0)
    .sort((a, b) =>
      a.left === b.left ? a.right.localeCompare(b.right) : a.left.localeCompare(b.left),
    )
    .map(pair => `${pair.left}|||${pair.right}`)
    .join('@@@');

const buildOptionsKey = (options: AdminQuizOption[]): string =>
  [...options]
    .map(option => ({ id: option.id.trim(), text: option.text.trim() }))
    .filter(option => option.id.length > 0)
    .sort((a, b) => a.id.localeCompare(b.id))
    .map(option => `${option.id}|||${option.text}`)
    .join('@@@');

export const AdminReportDetail = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const params = useParams();
  const { confirm } = useModal();
  const { showToast } = useToast();

  const reportId = Number(params.reportId);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [report, setReport] = useState<ReportResponse | null>(null);
  const [quiz, setQuiz] = useState<AdminQuizDetailResponse | null>(null);

  const [isEditing, setIsEditing] = useState(false);
  const [isQuizOpen, setIsQuizOpen] = useState(true);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isReportOpen, setIsReportOpen] = useState(true);
  const [tab, setTab] = useState<TabKey>('edit');
  const [isSaving, setIsSaving] = useState(false);

  const [draftQuestion, setDraftQuestion] = useState('');
  const [draftExplanation, setDraftExplanation] = useState('');
  const [draftOptions, setDraftOptions] = useState<AdminQuizOption[]>([]);
  const [draftCode, setDraftCode] = useState('');
  const [draftLanguage, setDraftLanguage] = useState('');
  const [draftCorrectOptionId, setDraftCorrectOptionId] = useState('');
  const [draftMatchingPairs, setDraftMatchingPairs] = useState<MatchingPair[]>([]);

  const resetDraftFromQuiz = (quizDetail: AdminQuizDetailResponse) => {
    setDraftQuestion(quizDetail.content.question ?? '');
    setDraftExplanation(quizDetail.explanation ?? '');
    setDraftOptions(normalizeOptions(quizDetail.content.options));
    setDraftCode(quizDetail.content.code ?? quizDetail.content.code_metadata?.snippet ?? '');
    setDraftLanguage(
      quizDetail.content.language ?? quizDetail.content.code_metadata?.language ?? '',
    );

    const extracted = extractCorrectAnswer(toQuizType(quizDetail.type) ?? 'mcq', quizDetail.answer);
    setDraftCorrectOptionId(typeof extracted === 'string' ? extracted : '');
    setDraftMatchingPairs(toMatchingPairs(extracted));
  };

  useEffect(() => {
    if (!Number.isInteger(reportId) || reportId <= 0) {
      setError('유효한 reportId가 필요합니다.');
      setLoading(false);
      return;
    }

    let mounted = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const reportDetail = await reportService.getReport(reportId);
        const quizDetail = await adminService.getQuiz(reportDetail.quizId);

        if (mounted) {
          setReport(reportDetail);
          setQuiz(quizDetail);
          resetDraftFromQuiz(quizDetail);
        }
      } catch (err) {
        if (mounted) {
          setError(err instanceof Error ? err.message : '데이터를 불러오지 못했습니다.');
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    void run();
    return () => {
      mounted = false;
    };
  }, [reportId]);

  const quizType = useMemo(() => (quiz ? toQuizType(quiz.type) : null), [quiz]);

  const quizQuestion: QuizQuestion | null = useMemo(() => {
    if (!quiz) return null;
    const type = toQuizType(quiz.type);
    if (!type) return null;
    return {
      id: quiz.id,
      type,
      content: quiz.content as QuizQuestion['content'],
    } as QuizQuestion;
  }, [quiz]);

  const correctAnswer = useMemo(() => {
    if (!quiz || !quizType) return null;
    return extractCorrectAnswer(quizType, quiz.answer);
  }, [quiz, quizType]);

  const effectiveCorrectAnswer: CorrectAnswerType | null = useMemo(() => {
    if (!quizType) return null;
    if (quizType === 'matching') {
      return isEditing && tab === 'preview' ? { pairs: draftMatchingPairs } : correctAnswer;
    }
    if (isEditing && tab === 'preview') return draftCorrectOptionId.trim();
    return correctAnswer;
  }, [correctAnswer, draftCorrectOptionId, draftMatchingPairs, isEditing, quizType, tab]);

  const previewQuestion: QuizQuestion | null = useMemo(() => {
    if (!quiz || !quizType) return null;

    const content: Record<string, unknown> = {
      ...(quiz.content as Record<string, unknown>),
      question: draftQuestion,
      options: draftOptions,
    };

    if (quizType === 'code') {
      content.code = draftCode;
      content.language = draftLanguage;
      // Keep code_metadata in sync for renderer preview (server will re-format after save).
      content.code_metadata = { language: draftLanguage || 'javascript', snippet: draftCode };
    }

    return {
      id: quiz.id,
      type: quizType,
      content: content as unknown as QuizQuestion['content'],
    } as QuizQuestion;
  }, [draftCode, draftLanguage, draftOptions, draftQuestion, quiz, quizType]);

  const handleChangeOptionText = (optionId: string, value: string) => {
    setDraftOptions(prev =>
      prev.map(option => (option.id === optionId ? { ...option, text: value } : option)),
    );
  };

  const handleCancelEdit = async () => {
    if (!quiz) {
      setIsEditing(false);
      setIsEditOpen(false);
      setTab('edit');
      return;
    }

    if (hasChanges) {
      const shouldCancel = await confirm({
        title: '수정 취소',
        content: '변경사항이 있습니다. 취소하면 변경사항이 사라집니다. 계속할까요?',
        confirmText: '취소하기',
      });

      if (!shouldCancel) return;
    }

    resetDraftFromQuiz(quiz);
    setIsEditing(false);
    setIsEditOpen(false);
    setTab('edit');
  };

  const hasChanges = useMemo(() => {
    if (!quiz) return false;
    const baseQuestion = (quiz.content.question ?? '').trim();
    const nextQuestion = draftQuestion.trim();

    const baseExplanation = (quiz.explanation ?? '').trim();
    const nextExplanation = draftExplanation.trim();

    if (baseQuestion !== nextQuestion) return true;
    if (baseExplanation !== nextExplanation) return true;

    const baseOptionsKey = buildOptionsKey(normalizeOptions(quiz.content.options));
    const nextOptionsKey = buildOptionsKey(normalizeOptions(draftOptions));
    if (baseOptionsKey !== nextOptionsKey) return true;

    if (quizType !== 'matching') {
      const baseCorrectId = typeof correctAnswer === 'string' ? correctAnswer.trim() : '';
      const nextCorrectId = draftCorrectOptionId.trim();
      if (baseCorrectId !== nextCorrectId) return true;
    } else {
      const basePairsKey = buildPairsKey(toMatchingPairs(correctAnswer));
      const nextPairsKey = buildPairsKey(draftMatchingPairs);
      if (basePairsKey !== nextPairsKey) return true;
    }

    if (quizType === 'code') {
      const baseCode = (quiz.content.code ?? '').trim();
      const nextCode = draftCode.trim();
      const baseLang = (quiz.content.language ?? '').trim();
      const nextLang = draftLanguage.trim();
      if (baseCode !== nextCode) return true;
      if (baseLang !== nextLang) return true;
    }

    return false;
  }, [
    correctAnswer,
    draftCode,
    draftCorrectOptionId,
    draftExplanation,
    draftLanguage,
    draftMatchingPairs,
    draftOptions,
    draftQuestion,
    quiz,
    quizType,
  ]);

  const handleSave = async () => {
    if (!quiz) return;
    if (!hasChanges) {
      showToast('변경사항이 없습니다.');
      return;
    }

    if (tab !== 'preview') {
      const shouldMove = await confirm({
        title: '저장 전 확인',
        content: '저장 전에 미리보기 탭에서 변경사항을 확인할까요?',
        confirmText: '미리보기',
      });

      if (shouldMove) {
        setTab('preview');
      }
      return;
    }

    const isConfirmed = await confirm({
      title: '퀴즈 수정',
      content: '변경사항을 저장할까요?',
      confirmText: '저장',
    });

    if (!isConfirmed) return;

    const nextCorrectId = draftCorrectOptionId.trim();
    if (quizType !== 'matching' && !nextCorrectId) {
      showToast('정답을 선택해주세요.');
      return;
    }

    if (quizType === 'matching') {
      const leftCount =
        quizQuestion?.type === 'matching' ? quizQuestion.content.matching_metadata.left.length : 0;
      const rightCount =
        quizQuestion?.type === 'matching' ? quizQuestion.content.matching_metadata.right.length : 0;
      const pairs = draftMatchingPairs;
      const leftSet = new Set(pairs.map(pair => pair.left.trim()));
      const rightSet = new Set(pairs.map(pair => pair.right.trim()));

      if (leftCount === 0 || rightCount === 0) {
        showToast('매칭 선택지 정보를 찾을 수 없습니다.');
        return;
      }

      if (leftCount !== rightCount) {
        showToast('좌/우 선택지 개수가 동일하지 않습니다.');
        return;
      }

      if (
        pairs.length !== leftCount ||
        leftSet.size !== leftCount ||
        rightSet.size !== rightCount
      ) {
        showToast(`정답 쌍을 ${leftCount}개 모두 매칭해주세요.`);
        return;
      }
    }

    const payload: Record<string, unknown> = {};

    const baseQuestion = (quiz.content.question ?? '').trim();
    const nextQuestion = draftQuestion.trim();
    if (baseQuestion !== nextQuestion) {
      payload.question = nextQuestion;
    }

    const baseExplanation = (quiz.explanation ?? '').trim();
    const nextExplanation = draftExplanation.trim();
    if (baseExplanation !== nextExplanation) {
      payload.explanation = nextExplanation.length > 0 ? nextExplanation : null;
    }

    const baseOptionsKey = buildOptionsKey(normalizeOptions(quiz.content.options));
    const nextOptionsKey = buildOptionsKey(normalizeOptions(draftOptions));
    if (baseOptionsKey !== nextOptionsKey) {
      payload.options = normalizeOptions(draftOptions);
    }

    if (quizType !== 'matching') {
      const baseCorrectId = typeof correctAnswer === 'string' ? correctAnswer.trim() : '';
      if (baseCorrectId !== nextCorrectId) {
        payload.correctOptionId = nextCorrectId;
      }
    } else {
      const basePairsKey = buildPairsKey(toMatchingPairs(correctAnswer));
      const nextPairsKey = buildPairsKey(draftMatchingPairs);
      if (basePairsKey !== nextPairsKey) {
        payload.correctPairs = draftMatchingPairs.map(pair => ({
          left: pair.left.trim(),
          right: pair.right.trim(),
        }));
      }
    }

    if (quizType === 'code') {
      const baseCode = (quiz.content.code ?? '').trim();
      const nextCode = draftCode.trim();
      if (baseCode !== nextCode) {
        payload.code = nextCode;
      }

      const baseLang = (quiz.content.language ?? '').trim();
      const nextLang = draftLanguage.trim();
      if (baseLang !== nextLang && nextLang.length > 0) {
        payload.language = nextLang;
      }
    }

    setIsSaving(true);
    try {
      const result = await adminService.updateQuiz(quiz.id, payload);
      if (!result.updated) {
        showToast('변경사항이 없어 저장하지 않았습니다.');
        return;
      }

      const refreshed = await adminService.getQuiz(quiz.id);
      setQuiz(refreshed);
      resetDraftFromQuiz(refreshed);
      setIsEditing(false);
      setIsEditOpen(false);
      setTab('edit');
      showToast('저장했습니다.');
    } catch (err) {
      showToast(err instanceof Error ? err.message : '저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  if (loading) {
    return <div css={statusStyle(theme)}>로딩 중...</div>;
  }

  if (error) {
    return <div css={statusStyle(theme)}>에러: {error}</div>;
  }

  if (!report || !quiz || !quizQuestion || !quizType) {
    return <div css={statusStyle(theme)}>데이터가 없습니다.</div>;
  }

  return (
    <div css={pageStyle}>
      <header css={topBarStyle(theme)}>
        <div css={topLeftStyle}>
          <Button
            variant="secondary"
            type="button"
            onClick={() => navigate('/admin/quizzes/reports')}
          >
            목록으로
          </Button>
          <div css={metaStyle(theme)}>
            <div css={metaTitleStyle(theme)}>리포트 #{report.id}</div>
            <div css={metaSubStyle(theme)}>퀴즈 #{report.quizId}</div>
          </div>
        </div>
        <div css={topRightStyle}>
          {!isEditing ? (
            <Button
              variant="primary"
              type="button"
              onClick={() => {
                setIsEditing(true);
                setIsEditOpen(true);
              }}
            >
              수정하기
            </Button>
          ) : (
            <>
              <Button
                variant="secondary"
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
              >
                취소
              </Button>
              <Button
                variant="primary"
                type="button"
                onClick={handleSave}
                disabled={isSaving || !hasChanges}
              >
                {isSaving ? '저장 중...' : '저장'}
              </Button>
            </>
          )}
        </div>
      </header>

      <section css={cardStyle(theme)} aria-label="퀴즈 상세">
        <button
          type="button"
          css={sectionHeaderButtonStyle(theme)}
          onClick={() => setIsQuizOpen(prev => !prev)}
          aria-expanded={isQuizOpen}
        >
          <h2 css={sectionTitleStyle(theme)}>퀴즈 내용</h2>
          <span css={sectionToggleStyle(theme)}>{isQuizOpen ? '접기' : '펼치기'}</span>
        </button>

        {isQuizOpen && (
          <>
            <div css={questionTitleStyle(theme)}>
              Q. <TextWithCodeStyle text={quizQuestion.content.question} />
            </div>
            <div css={quizBodyStyle}>
              <QuizRenderer
                question={quizQuestion}
                selectedAnswer={
                  quizType === 'matching' ? { pairs: toMatchingPairs(correctAnswer) } : null
                }
                correctAnswer={correctAnswer}
                onAnswerChange={() => {}}
                showResult={true}
                disabled={true}
                mode="readonly"
              />
            </div>

            {quiz.explanation && (
              <div css={explanationStyle(theme)}>
                <div css={explanationLabelStyle(theme)}>해설</div>
                <div css={explanationTextStyle(theme)}>
                  <TextWithCodeStyle text={quiz.explanation} />
                </div>
              </div>
            )}
          </>
        )}
      </section>

      {isEditing && (
        <section css={cardStyle(theme)} aria-label="퀴즈 수정">
          <button
            type="button"
            css={sectionHeaderButtonStyle(theme)}
            onClick={() => setIsEditOpen(prev => !prev)}
            aria-expanded={isEditOpen}
          >
            <h2 css={sectionTitleStyle(theme)}>수정</h2>
            <span css={sectionToggleStyle(theme)}>{isEditOpen ? '접기' : '펼치기'}</span>
          </button>

          {isEditOpen && (
            <>
              <div css={editHeaderStyle}>
                <div css={tabBarStyle(theme)} role="tablist" aria-label="미리보기 탭">
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'edit'}
                    onClick={() => setTab('edit')}
                    css={[tabButtonStyle(theme), tab === 'edit' && tabButtonActiveStyle(theme)]}
                  >
                    편집
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={tab === 'preview'}
                    onClick={async () => {
                      if (tab === 'preview') return;
                      if (!hasChanges) {
                        setTab('preview');
                        return;
                      }

                      const shouldPreview = await confirm({
                        title: '미리보기',
                        content: '편집한 내용을 미리보기로 확인할까요?',
                        confirmText: '확인',
                      });

                      if (shouldPreview) {
                        setTab('preview');
                      }
                    }}
                    css={[tabButtonStyle(theme), tab === 'preview' && tabButtonActiveStyle(theme)]}
                  >
                    미리보기
                  </button>
                </div>
              </div>

              {tab === 'edit' ? (
                <div css={formStyle}>
                  <label css={labelStyle(theme)} htmlFor="admin-quiz-question">
                    제목/문제
                  </label>
                  <textarea
                    id="admin-quiz-question"
                    css={textareaStyle(theme)}
                    value={draftQuestion}
                    onChange={event => setDraftQuestion(event.target.value)}
                  />

                  {quizType !== 'matching' && (
                    <>
                      <label css={labelStyle(theme)} htmlFor="admin-quiz-correct">
                        정답
                      </label>
                      <select
                        id="admin-quiz-correct"
                        css={inputStyle(theme)}
                        value={draftCorrectOptionId}
                        onChange={event => setDraftCorrectOptionId(event.target.value)}
                        disabled={draftOptions.length === 0}
                      >
                        <option value="" disabled>
                          정답 선택
                        </option>
                        {draftOptions.map(option => (
                          <option key={option.id} value={option.id}>
                            {option.id} - {option.text.trim().slice(0, 40)}
                          </option>
                        ))}
                      </select>

                      <div css={labelStyle(theme)}>선지</div>
                      <div css={optionsGridStyle}>
                        {draftOptions.map(option => (
                          <label key={option.id} css={optionRowStyle(theme)}>
                            <span css={optionIdStyle(theme)}>{option.id}</span>
                            <textarea
                              css={optionTextareaStyle(theme)}
                              value={option.text}
                              onChange={event =>
                                handleChangeOptionText(option.id, event.target.value)
                              }
                            />
                          </label>
                        ))}
                      </div>
                    </>
                  )}

                  {quizType === 'matching' && (
                    <>
                      <div css={labelStyle(theme)}>정답 매칭</div>
                      <div css={noticeStyle(theme)}>
                        좌측 항목을 누른 다음 우측 항목을 눌러 정답 쌍을 만듭니다. 이미 연결된
                        항목을 누르면 연결이 해제됩니다.
                      </div>
                      <div css={matchingEditorHeaderStyle}>
                        <div css={matchingEditorCountStyle(theme)}>
                          {draftMatchingPairs.length}개 연결됨
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setDraftMatchingPairs([])}
                        >
                          초기화
                        </Button>
                      </div>
                      <QuizRenderer
                        question={quizQuestion}
                        selectedAnswer={{ pairs: draftMatchingPairs }}
                        correctAnswer={null}
                        onAnswerChange={answer =>
                          setDraftMatchingPairs((answer as { pairs?: MatchingPair[] }).pairs ?? [])
                        }
                        showResult={false}
                        disabled={false}
                        mode="solve"
                      />
                    </>
                  )}

                  {quizType === 'code' && (
                    <>
                      <label css={labelStyle(theme)} htmlFor="admin-quiz-language">
                        언어
                      </label>
                      <input
                        id="admin-quiz-language"
                        css={inputStyle(theme)}
                        value={draftLanguage}
                        onChange={event => setDraftLanguage(event.target.value)}
                        placeholder="javascript"
                      />

                      <label css={labelStyle(theme)} htmlFor="admin-quiz-code">
                        코드(내용)
                      </label>
                      <textarea
                        id="admin-quiz-code"
                        css={textareaStyle(theme)}
                        value={draftCode}
                        onChange={event => setDraftCode(event.target.value)}
                      />
                    </>
                  )}

                  <label css={labelStyle(theme)} htmlFor="admin-quiz-explanation">
                    해설
                  </label>
                  <textarea
                    id="admin-quiz-explanation"
                    css={textareaStyle(theme)}
                    value={draftExplanation}
                    onChange={event => setDraftExplanation(event.target.value)}
                    placeholder="(선택) 해설을 입력하세요."
                  />
                </div>
              ) : (
                <div css={previewBoxStyle(theme)}>
                  <div css={questionTitleStyle(theme)}>
                    Q. <TextWithCodeStyle text={draftQuestion} />
                  </div>
                  {previewQuestion && (
                    <QuizRenderer
                      question={previewQuestion}
                      selectedAnswer={
                        quizType === 'matching' ? { pairs: draftMatchingPairs } : null
                      }
                      correctAnswer={effectiveCorrectAnswer}
                      onAnswerChange={() => {}}
                      showResult={true}
                      disabled={true}
                      mode="readonly"
                    />
                  )}
                  <div css={explanationStyle(theme)}>
                    <div css={explanationLabelStyle(theme)}>해설(미리보기)</div>
                    <div css={explanationTextStyle(theme)}>
                      <TextWithCodeStyle text={draftExplanation || '(해설 없음)'} />
                    </div>
                  </div>
                </div>
              )}

              <div css={editFooterStyle}>
                <div css={changeHintStyle(theme)}>
                  {hasChanges ? '변경사항이 있습니다.' : '변경사항이 없습니다.'}
                </div>
              </div>
            </>
          )}
        </section>
      )}

      <section css={cardStyle(theme)} aria-label="신고 상세">
        <button
          type="button"
          css={sectionHeaderButtonStyle(theme)}
          onClick={() => setIsReportOpen(prev => !prev)}
          aria-expanded={isReportOpen}
        >
          <h2 css={sectionTitleStyle(theme)}>신고 정보</h2>
          <span css={sectionToggleStyle(theme)}>{isReportOpen ? '접기' : '펼치기'}</span>
        </button>

        {isReportOpen && (
          <div css={reportGridStyle}>
            <div css={reportItemStyle(theme)}>
              <div css={reportLabelStyle(theme)}>유저</div>
              <div css={reportValueStyle(theme)}>
                {report.userDisplayName
                  ? report.userId
                    ? `${report.userDisplayName} (#${report.userId})`
                    : report.userDisplayName
                  : '게스트'}
              </div>
            </div>
            <div css={reportItemStyle(theme)}>
              <div css={reportLabelStyle(theme)}>날짜</div>
              <div css={reportValueStyle(theme)}>
                {new Date(report.createdAt).toLocaleString('ko-KR')}
              </div>
            </div>
            <div css={reportItemStyle(theme)}>
              <div css={reportLabelStyle(theme)}>신고 내용</div>
              <div css={reportValueStyle(theme)}>{report.report_description}</div>
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

const pageStyle = css`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const statusStyle = (theme: Theme) => css`
  width: 100%;
  padding: 24px;
  border-radius: ${theme.borderRadius.large};
  background: ${theme.colors.surface.strong};
  border: 1px solid ${theme.colors.border.default};
`;

const topBarStyle = (theme: Theme) => css`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
  padding: 16px;
  border-radius: ${theme.borderRadius.large};
  background: ${theme.colors.surface.strong};
  border: 1px solid ${theme.colors.border.default};
`;

const topLeftStyle = css`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const topRightStyle = css`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const metaStyle = (theme: Theme) => css`
  display: flex;
  flex-direction: column;
  gap: 2px;
  color: ${theme.colors.text.default};
`;

const metaTitleStyle = (theme: Theme) => css`
  font-weight: 800;
  color: ${theme.colors.text.strong};
`;

const metaSubStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
`;

const cardStyle = (theme: Theme) => css`
  width: 100%;
  padding: 20px;
  border-radius: ${theme.borderRadius.large};
  background: ${theme.colors.surface.strong};
  border: 1px solid ${theme.colors.border.default};
`;

const sectionTitleStyle = (theme: Theme) => css`
  margin: 0 0 12px;
  font-size: ${theme.typography['16Bold'].fontSize};
  color: ${theme.colors.text.strong};
`;

const sectionHeaderButtonStyle = (theme: Theme) => css`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;
  color: ${theme.colors.text.strong};
`;

const sectionToggleStyle = (theme: Theme) => css`
  font-size: ${theme.typography['12Medium'].fontSize};
  color: ${theme.colors.text.weak};
  font-weight: 800;
`;

const questionTitleStyle = (theme: Theme) => css`
  color: ${theme.colors.text.strong};
  font-weight: 800;
  line-height: 1.45;
  margin-bottom: 12px;
`;

const quizBodyStyle = css`
  width: 100%;
`;

const explanationStyle = (theme: Theme) => css`
  margin-top: 14px;
  padding: 12px 14px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
  border: 1px solid ${theme.colors.border.default};
`;

const explanationLabelStyle = (theme: Theme) => css`
  font-weight: 800;
  color: ${theme.colors.text.strong};
  margin-bottom: 8px;
`;

const explanationTextStyle = (theme: Theme) => css`
  color: ${theme.colors.text.default};
  line-height: 1.6;
`;

const editHeaderStyle = css`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-wrap: wrap;
`;

const tabBarStyle = (theme: Theme) => css`
  display: flex;
  border: 1px solid ${theme.colors.border.default};
  border-radius: ${theme.borderRadius.medium};
  overflow: hidden;
`;

const tabButtonStyle = (theme: Theme) => css`
  padding: 10px 14px;
  border: none;
  cursor: pointer;
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.default};
  font-weight: 700;
`;

const tabButtonActiveStyle = (theme: Theme) => css`
  background: ${theme.colors.primary.main};
  color: ${theme.colors.grayscale[50]};
`;

const formStyle = css`
  margin-top: 12px;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const labelStyle = (theme: Theme) => css`
  font-weight: 800;
  color: ${theme.colors.text.strong};
`;

const inputStyle = (theme: Theme) => css`
  padding: 10px 12px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.default};
`;

const textareaStyle = (theme: Theme) => css`
  min-height: 96px;
  padding: 10px 12px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.default};
  color: ${theme.colors.text.default};
  resize: vertical;
  line-height: 1.6;
`;

const optionsGridStyle = css`
  display: grid;
  gap: 10px;
`;

const matchingEditorHeaderStyle = css`
  margin: 10px 0 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
`;

const matchingEditorCountStyle = (theme: Theme) => css`
  font-weight: 800;
  color: ${theme.colors.text.weak};
`;

const optionRowStyle = (theme: Theme) => css`
  display: grid;
  grid-template-columns: 56px 1fr;
  gap: 10px;
  align-items: start;
  padding: 10px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.default};
`;

const optionIdStyle = (theme: Theme) => css`
  font-weight: 900;
  color: ${theme.colors.text.weak};
  padding-top: 10px;
`;

const optionTextareaStyle = (theme: Theme) => css`
  ${textareaStyle(theme)};
  min-height: 64px;
`;

const previewBoxStyle = (theme: Theme) => css`
  margin-top: 12px;
  padding: 14px;
  border-radius: ${theme.borderRadius.medium};
  border: 1px solid ${theme.colors.border.default};
  background: ${theme.colors.surface.default};
`;

const noticeStyle = (theme: Theme) => css`
  padding: 10px 12px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
  border: 1px solid ${theme.colors.border.default};
  color: ${theme.colors.text.weak};
  font-weight: 700;
`;

const editFooterStyle = css`
  margin-top: 12px;
  display: flex;
  justify-content: flex-end;
`;

const changeHintStyle = (theme: Theme) => css`
  color: ${theme.colors.text.weak};
  font-weight: 700;
`;

const reportGridStyle = css`
  display: grid;
  gap: 12px;
`;

const reportItemStyle = (theme: Theme) => css`
  padding: 12px 14px;
  border-radius: ${theme.borderRadius.medium};
  background: ${theme.colors.surface.default};
  border: 1px solid ${theme.colors.border.default};
`;

const reportLabelStyle = (theme: Theme) => css`
  font-weight: 900;
  color: ${theme.colors.text.weak};
  margin-bottom: 6px;
`;

const reportValueStyle = (theme: Theme) => css`
  color: ${theme.colors.text.default};
  line-height: 1.6;
  white-space: pre-wrap;
`;
