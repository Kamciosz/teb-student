/**
 * PL: Router Hono podtoru 5a (ankieta: głosowanie), podpięty pod /api/surveys/vote w worker/mounts.ts. Trzy adresy: lista ankiet, szczegóły ankiety i wysłanie odpowiedzi.
 *     Kody odpowiedzi: 401 brak ucznia, 404 nie ma ankiety, 410 ankieta zakończona, 400 złe odpowiedzi, 409 uczeń już głosował.
 * EN: The Hono router of subtrack 5a (survey: voting), mounted under /api/surveys/vote in worker/mounts.ts. Three routes: the survey list, the survey details and sending the answers.
 *     Response codes: 401 no student, 404 no such survey, 410 survey ended, 400 bad answers, 409 the student has already voted.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/queries.ts::listSurveys
 * @uses worker/surveys/vote/validation.ts::checkAnswers
 * @uses worker/surveys/vote/temporaryStudent.ts::getStudentId
 * @used_by worker/surveys/vote/index.ts::surveysVoteApp
 * @used_by worker/surveys/vote/vote.test.ts::surveysVoteApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono, type Context } from 'hono';
// PL: Typ środowiska Workera z bazą D1 (binding DB).
// EN: The Worker environment type with the D1 database (the DB binding).
import type { Env } from '../../shared';
// PL: Termin ankiety.
// EN: The survey deadline.
import { isSurveyActive, warsawToday } from './deadline';
// PL: Baza i wiązania.
// EN: The database and the bindings.
import { openDatabase, type VoteDatabase } from './database';
// PL: Zapytania do bazy.
// EN: The database queries.
import { AlreadyVotedError, findSurvey, hasVoted, listSurveys, loadQuestions, recordVote } from './queries';
// PL: Numer ucznia (tymczasowy, do zgłoszenia #42).
// EN: The student id (temporary, until issue #42).
import { getStudentId } from './temporaryStudent';
// PL: Sprawdzanie odpowiedzi.
// EN: Checking the answers.
import { checkAnswers, parseAnswersBody } from './validation';

/**
 * PL: Uczeń i baza potrzebne do każdej trasy, albo gotowa odpowiedź z błędem.
 * EN: The student and the database every route needs, or a ready error response.
 */
type Session = { userId: string; db: VoteDatabase } | Response;

/**
 * PL: Ustala ucznia i otwiera bazę. Brak ucznia to 401.
 * EN: Resolves the student and opens the database. No student is 401.
 *
 * @param context - PL: zapytanie Hono z bazą w context.env.DB. EN: the Hono request with the database in context.env.DB.
 * @returns PL: uczeń z bazą albo odpowiedź z błędem do oddania od razu. EN: the student with the database, or an error response to return at once.
 */
function openSession(context: Context<{ Bindings: Env }>): Session {
  // PL: Najpierw uczeń: bez niego nie ma po co otwierać bazy.
  // EN: The student first: without one there is no point in opening the database.
  const userId = getStudentId(context);
  if (userId === null) return context.json({ error: 'unauthorized' }, 401);
  return { userId, db: openDatabase(context.env.DB) };
}

/**
 * PL: Router podtoru 5a. Baza jest w context.env.DB (typ Env z worker/shared).
 * EN: The router of subtrack 5a. The database is in context.env.DB (the Env type from worker/shared).
 */
export const surveysVoteApp = new Hono<{ Bindings: Env }>();

// PL: GET / – lista ankiet: trwające z liczbą dni i znacznikiem „wypełniona” oraz zakończone.
// EN: GET / – the survey list: running ones with the days left and the "filled" mark, and ended ones.
surveysVoteApp.get('/', async (context) => {
  const session = openSession(context);
  if (session instanceof Response) return session;
  return context.json(await listSurveys(session.db, session.userId, warsawToday(new Date())));
});

// PL: GET /:surveyId – szczegóły ankiety do wypełnienia: pytania i odpowiedzi, bez liczników głosów.
// EN: GET /:surveyId – the details of a survey to fill in: questions and options, without the vote counters.
surveysVoteApp.get('/:surveyId', async (context) => {
  const session = openSession(context);
  if (session instanceof Response) return session;

  // PL: Nieznana ankieta to 404.
  // EN: An unknown survey is 404.
  const survey = await findSurvey(session.db, context.req.param('surveyId'));
  if (survey === null) return context.json({ error: 'not_found' }, 404);

  // PL: Złóż szczegóły: pytania, termin i znacznik „wypełniona”.
  // EN: Build the details: the questions, the deadline and the "filled" mark.
  return context.json({
    id: survey.id,
    label: survey.label,
    title: survey.title,
    isActive: isSurveyActive(survey.endsOn, warsawToday(new Date())),
    hasVoted: await hasVoted(session.db, survey.id, session.userId),
    questions: await loadQuestions(session.db, survey.id),
  });
});

// PL: POST /:surveyId/answers – wysłanie odpowiedzi. Zapisuje głos tylko raz na ucznia.
// EN: POST /:surveyId/answers – sending the answers. Writes the vote only once per student.
surveysVoteApp.post('/:surveyId/answers', async (context) => {
  const session = openSession(context);
  if (session instanceof Response) return session;
  const { db, userId } = session;

  // PL: Ankieta musi istnieć i jeszcze trwać.
  // EN: The survey must exist and still be running.
  const survey = await findSurvey(db, context.req.param('surveyId'));
  if (survey === null) return context.json({ error: 'not_found' }, 404);
  if (!isSurveyActive(survey.endsOn, warsawToday(new Date()))) return context.json({ error: 'survey_ended' }, 410);

  // PL: Odpowiedzi muszą mieć dobry kształt i pasować do pytań tej ankiety.
  // EN: The answers must have a valid shape and match this survey's questions.
  const answers = parseAnswersBody(await context.req.json().catch(() => null));
  const questions = await loadQuestions(db, survey.id);
  const check = answers === null ? null : checkAnswers(questions.map((q) => ({ questionId: q.id, optionIds: q.options.map((o) => o.id) })), answers);
  if (check === null || !check.ok) return context.json({ error: 'invalid_answers' }, 400);

  // PL: Zapisz głos. Drugi głos tego ucznia (także równoległy) kończy się 409, a liczniki zostają nietknięte.
  // EN: Write the vote. A second vote from this student (also a parallel one) ends with 409, and the counters stay untouched.
  try {
    await recordVote(db, { surveyId: survey.id, userId, optionIds: check.optionIds });
  } catch (error) {
    if (error instanceof AlreadyVotedError) return context.json({ error: 'already_voted' }, 409);
    throw error;
  }
  return context.json({ status: 'ok' }, 201);
});
