/**
 * PL: Hak wysyłania głosu: pilnuje, żeby głos poszedł tylko raz naraz, mówi, czy trwa wysyłanie, i po sukcesie przechodzi do potwierdzenia. Błąd sieci zostawia odpowiedzi na ekranie, żeby można było spróbować jeszcze raz.
 * EN: The vote-sending hook: makes sure the vote goes out only once at a time, tells whether sending is in progress, and after success moves to the confirmation. A network error leaves the answers on screen so the student can try again.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/surveyApi.ts::sendAnswers
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyQuestions
 */

// PL: Haki Reacta: referencja i stan.
// EN: React hooks: a ref and state.
import { useRef, useState } from 'react';
// PL: Przejście do innego ekranu.
// EN: Navigation to another screen.
import { useNavigate } from 'react-router';
import { sendAnswers } from './surveyApi';
import type { AnswerMap } from './types';

/** PL: Co poszło nie tak przy wysyłaniu: nic, głos już jest, ankieta się skończyła albo nie udało się wysłać. EN: What went wrong when sending: nothing, the vote already exists, the survey ended or sending failed. */
export type Problem = 'none' | 'already_voted' | 'ended' | 'failed';

/**
 * PL: Daje funkcję wysyłającą głos oraz stan wysyłania i problemu.
 * EN: Gives the function that sends the vote and the sending and problem state.
 *
 * @param surveyId - PL: numer ankiety. EN: the survey id.
 * @param answers - PL: odpowiedzi do wysłania. EN: the answers to send.
 * @returns PL: funkcja wysyłająca, znacznik trwania i problem. EN: the send function, the in-progress flag and the problem.
 */
export function useVoteSubmit(surveyId: string, answers: AnswerMap): { submit: () => Promise<void>; sending: boolean; problem: Problem } {
  const navigate = useNavigate();
  const [sending, setSending] = useState(false);
  const [problem, setProblem] = useState<Problem>('none');
  // PL: Drugie stuknięcie, zanim ekran się przerysuje, nie może wysłać głosu drugi raz.
  // EN: A second tap before the screen redraws must not send the vote a second time.
  const inFlight = useRef(false);

  /**
   * PL: Wysyła głos. Zmienia dane na serwerze.
   * EN: Sends the vote. Changes data on the server.
   */
  async function submit(): Promise<void> {
    if (inFlight.current) return;
    inFlight.current = true;
    setSending(true);
    setProblem('none');
    try {
      const result = await sendAnswers(surveyId, answers);
      if (result === 'ok') await navigate('/surveys/vote/done', { replace: true });
      else setProblem(result);
    } catch {
      setProblem('failed');
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }

  return { submit, sending, problem };
}
