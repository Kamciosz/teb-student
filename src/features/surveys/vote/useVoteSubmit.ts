/**
 * PL: Hak wysyłania głosu: pilnuje, żeby głos poszedł tylko raz naraz, mówi, czy trwa wysyłanie, i po sukcesie przechodzi do potwierdzenia. Błąd sieci zostawia odpowiedzi na ekranie, żeby można było spróbować jeszcze raz.
 * EN: The vote-sending hook: makes sure the vote goes out only once at a time, tells whether sending is in progress, and after success moves to the confirmation. A network error leaves the answers on screen so the student can try again.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/surveyApi.ts::sendAnswers
 * @uses src/features/surveys/vote/surveyQueries.ts::SURVEYS_VOTE_KEY
 * @used_by src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyQuestions
 */

// PL: Haki Reacta: referencja i stan.
// EN: React hooks: a ref and state.
import { useRef, useState } from 'react';
// PL: Klient zapytań, żeby po głosie odświeżyć listę i szczegóły ankiet.
// EN: The query client, to refresh the survey list and details after a vote.
import { useQueryClient } from '@tanstack/react-query';
// PL: Przejście do innego ekranu.
// EN: Navigation to another screen.
import { useNavigate } from 'react-router';
import { sendAnswers } from './surveyApi';
import { SURVEYS_VOTE_KEY } from './surveyQueries';
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
  const queryClient = useQueryClient();
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
      // PL: Po głosie (i po 409 oraz 410) zapisana lista jest nieaktualna. Oznaczamy ją tylko do odświeżenia: pobierze się przy wejściu na listę, a otwarty ekran nie miga.
      // EN: After a vote (and after 409 and 410) the saved list is outdated. We only mark it stale: it refetches when the list opens, and the open screen does not flicker.
      await queryClient.invalidateQueries({ queryKey: SURVEYS_VOTE_KEY, refetchType: 'none' });
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
