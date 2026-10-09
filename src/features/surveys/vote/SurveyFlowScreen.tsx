/**
 * PL: Ekrany 4.2 i 4.3 „Ankieta” (docs/projekt/EKRANY.md): jedno pytanie na ekranie, przycisk „Dalej” aktywny dopiero po wyborze odpowiedzi, a po ostatnim pytaniu wysłanie głosu. Pobiera ankietę i wysyła odpowiedzi.
 * EN: Screens 4.2 and 4.3 "Ankieta" (docs/projekt/EKRANY.md): one question per screen, the "Dalej" button active only after an option is chosen, and sending the vote after the last question. Fetches the survey and sends the answers.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/surveyApi.ts::fetchSurvey
 * @uses src/features/surveys/vote/useVoteSubmit.ts::useVoteSubmit
 * @used_by src/features/surveys/vote/SurveysVoteScreen.tsx::SurveysVoteScreen
 */

// PL: Haki Reacta: stan i stały odnośnik do funkcji.
// EN: React hooks: state and a stable function reference.
import { useCallback, useState } from 'react';
// PL: Parametr adresu.
// EN: The address parameter.
import { useParams } from 'react-router';
import { FlowNotice, FlowTop } from './FlowParts';
import { QuestionStep } from './QuestionStep';
import { fetchSurvey } from './surveyApi';
import type { AnswerMap, SurveyDetail } from './types';
import { useRemoteData } from './useRemoteData';
import { useVoteSubmit } from './useVoteSubmit';

// PL: Komunikaty o problemie z wysłaniem, które zastępują ekran pytań.
// EN: The messages about a sending problem that replace the question screen.
const BLOCKING_MESSAGES = {
  already_voted: { title: 'Już wypełniona', text: 'Ta ankieta jest już wypełniona. Nie można jej wypełnić drugi raz.' },
  ended: { title: 'Ankieta zakończona', text: 'Ta ankieta już się skończyła, więc nie przyjmujemy odpowiedzi.' },
} as const;

/**
 * PL: Rysuje pytania jedno po drugim i wysyła głos po ostatnim. Stan odpowiedzi leży tu, więc „Wstecz” nie gubi wyborów.
 * EN: Draws the questions one by one and sends the vote after the last. The answers state lives here, so "Wstecz" loses no choices.
 *
 * @param props - PL: ankieta z pytaniami. EN: the survey with its questions.
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
function SurveyQuestions({ survey }: { survey: SurveyDetail }) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<AnswerMap>({});
  const { submit, sending, problem } = useVoteSubmit(survey.id, answers);

  const question = survey.questions[step];
  if (problem === 'already_voted' || problem === 'ended') return <FlowNotice {...BLOCKING_MESSAGES[problem]} />;
  if (question === undefined) return <FlowNotice title="Brak pytań" text="Ta ankieta nie ma jeszcze pytań." />;

  const isLast = step === survey.questions.length - 1;
  const selectedId = answers[question.id];

  return (
    <main className="vote vote--flow" data-subtrack="5a">
      <FlowTop title={survey.title} step={step + 1} total={survey.questions.length} onBack={step === 0 ? null : () => setStep(step - 1)} />
      <QuestionStep question={question} number={step + 1} selectedId={selectedId} onSelect={(optionId) => setAnswers({ ...answers, [question.id]: optionId })} />
      <div className="vote-footer">
        {problem === 'failed' ? <p className="vote-error" role="alert">Nie udało się wysłać odpowiedzi. Sprawdź połączenie z internetem i spróbuj jeszcze raz.</p> : null}
        <button type="button" className="vote-button vote-button--primary" disabled={selectedId === undefined || sending} onClick={isLast ? submit : () => setStep(step + 1)}>
          {sending ? 'Wysyłam…' : isLast ? 'Wyślij odpowiedzi' : 'Dalej'}
        </button>
      </div>
    </main>
  );
}

/**
 * PL: Rysuje ekran ankiety o numerze z adresu. Pokazuje wczytywanie, błąd (na przykład brak internetu), komunikat o ankiecie zakończonej albo już wypełnionej, a w pozostałych przypadkach pytania.
 * EN: Draws the survey screen for the id in the address. Shows loading, an error (for example no internet), a message for an ended or already filled survey, and otherwise the questions.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveyFlowScreen() {
  const { surveyId = '' } = useParams();
  const load = useCallback(() => fetchSurvey(surveyId), [surveyId]);
  const { state, reload } = useRemoteData(load);

  if (state.status === 'loading') return <main className="vote vote--flow" data-subtrack="5a"><p className="vote-small" role="status">Wczytuję ankietę…</p></main>;
  if (state.status === 'error') return <FlowNotice title="Nie udało się pobrać ankiety" text="Sprawdź połączenie z internetem i spróbuj jeszcze raz." onRetry={reload} />;
  if (state.data.hasVoted) return <FlowNotice {...BLOCKING_MESSAGES.already_voted} />;
  if (!state.data.isActive) return <FlowNotice {...BLOCKING_MESSAGES.ended} />;
  return <SurveyQuestions survey={state.data} />;
}
