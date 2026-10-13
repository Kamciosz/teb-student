/**
 * PL: Drzwi modułu surveys po stronie serwera. Tylko zbiera index.ts jego podtorów (5a, 5b) i niczego nie zawiera. Worker importuje tylko stąd.
 * EN: The door of the surveys module on the server side. It only collects the index.ts files of its subtracks (5a, 5b) and contains nothing itself. The Worker imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/surveys/vote/index.ts::surveysVoteApp
 * @uses worker/surveys/admin/index.ts::surveysAdminApp
 * @uses worker/surveys/vote/index.ts::deleteSurveysStudentData
 * @uses worker/surveys/vote/index.ts::countSurveyParticipations
 * @used_by worker/mounts.ts::API_MOUNTS
 * @used_by worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 * @used_by worker/admin/…::countSurveyParticipations (panel Samorządu, podtor 8 / Student Council panel, subtrack 8)
 */

// PL: Router podtoru 5a (ankieta: głosowanie), funkcja kasująca dane ucznia i liczba udziałów w ankietach (countSurveyParticipations(env.DB) → number) dla ekranu panelu Samorządu. Liczba nie zawiera wyborów odpowiedzi.
// EN: The router of subtrack 5a (survey: voting), the function that deletes student data and the number of survey participations (countSurveyParticipations(env.DB) → number) for a screen of the Student Council panel. The number does not include the answers chosen.
export { surveysVoteApp, deleteSurveysStudentData, countSurveyParticipations } from './vote';

// PL: Router podtoru 5b (ankiety w panelu: tworzenie i wyniki).
// EN: The router of subtrack 5b (surveys in the panel: creating and results).
export { surveysAdminApp } from './admin';
