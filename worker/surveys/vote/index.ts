/**
 * PL: Drzwi podtoru 5a (ankieta: głosowanie) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 5a (survey: voting) on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/surveys/vote/routes.ts::surveysVoteApp
 * @uses worker/surveys/vote/deleteStudentData.ts::deleteSurveysStudentData
 * @used_by worker/surveys/index.ts::surveysVoteApp
 */

// PL: Router podtoru 5a.
// EN: The router of subtrack 5a.
export { surveysVoteApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu surveys. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the surveys module. worker/shared/accountDeletion.ts collects it.
export { deleteSurveysStudentData } from './deleteStudentData';
