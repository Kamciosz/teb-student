/**
 * PL: Router Hono podtoru 5a (ankieta: głosowanie), podpięty pod /api/surveys/vote w worker/mounts.ts. Trzy adresy: lista ankiet, szczegóły ankiety i wysłanie odpowiedzi.
 *     Kody odpowiedzi: 401 brak sesji ucznia, 404 nie ma ankiety, 410 ankieta zakończona, 400 złe odpowiedzi, 409 uczeń już głosował.
 * EN: The Hono router of subtrack 5a (survey: voting), mounted under /api/surveys/vote in worker/mounts.ts. Three routes: the survey list, the survey details and sending the answers.
 *     Response codes: 401 no student session, 404 no such survey, 410 survey ended, 400 bad answers, 409 the student has already voted.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/surveys/vote/queries.ts::listSurveys
 * @uses worker/surveys/vote/validation.ts::checkAnswers
 * @uses worker/auth/index.ts::requireStudent
 * @used_by worker/surveys/vote/index.ts::surveysVoteApp
 * @used_by worker/surveys/vote/vote.test.ts::surveysVoteApp
 */

// PL: Hono to router serwera. Dopasowuje adres zapytania do funkcji, która odpowie.
// EN: Hono is the server router. It matches the request URL to the function that answers.
import { Hono } from 'hono';
// PL: Sprawdzanie sesji ucznia z drzwi modułu auth: bez sesji 401, z sesją uczeń jest w context.get('student').
// EN: The student session check from the auth module door: 401 without a session, with a session the student is in context.get('student').
import { requireStudent, type StudentEnv } from '../../auth';
// PL: Termin ankiety.
// EN: The survey deadline.
import { isSurveyActive, warsawToday } from './deadline';
// PL: Otwarcie bazy z bindingu D1.
// EN: Opening the database from the D1 binding.
import { openDatabase } from './database';
// PL: Zapytania do bazy.
// EN: The database queries.
import { AlreadyVotedError, findSurvey, hasVoted, listSurveys, loadQuestions, recordVote } from './queries';
// PL: Sprawdzanie odpowiedzi.
// EN: Checking the answers.
import { checkAnswers, parseAnswersBody } from './validation';

/**
 * PL: Router podtoru 5a. Każdy adres wymaga zalogowanego ucznia (requireStudent), a baza jest w context.env.DB.
 * EN: The router of subtrack 5a. Every route requires a signed-in student (requireStudent), and the database is in context.env.DB.
 */
export const surveysVoteApp = new Hono<StudentEnv>().use(requireStudent);

// PL: GET / – lista ankiet: trwające z liczbą dni i znacznikiem „wypełniona” oraz zakończone.
// EN: GET / – the survey list: running ones with the days left and the "filled" mark, and ended ones.
surveysVoteApp.get('/', async (context) => {
  return context.json(await listSurveys(openDatabase(context.env.DB), context.get('student').id, warsawToday(new Date())));
});

// PL: GET /:surveyId – szczegóły ankiety do wypełnienia: pytania i odpowiedzi, bez liczników głosów.
// EN: GET /:surveyId – the details of a survey to fill in: questions and options, without the vote counters.
surveysVoteApp.get('/:surveyId', async (context) => {
  const db = openDatabase(context.env.DB);

  // PL: Nieznana ankieta to 404.
  // EN: An unknown survey is 404.
  const survey = await findSurvey(db, context.req.param('surveyId'));
  if (survey === null) return context.json({ error: 'not_found' }, 404);

  // PL: Złóż szczegóły: pytania, termin i znacznik „wypełniona”.
  // EN: Build the details: the questions, the deadline and the "filled" mark.
  return context.json({
    id: survey.id,
    label: survey.label,
    title: survey.title,
    isActive: isSurveyActive(survey.endsOn, warsawToday(new Date())),
    hasVoted: await hasVoted(db, survey.id, context.get('student').id),
    questions: await loadQuestions(db, survey.id),
  });
});

// PL: POST /:surveyId/answers – wysłanie odpowiedzi. Zapisuje głos tylko raz na ucznia.
// EN: POST /:surveyId/answers – sending the answers. Writes the vote only once per student.
surveysVoteApp.post('/:surveyId/answers', async (context) => {
  const db = openDatabase(context.env.DB);
  const userId = context.get('student').id;

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
