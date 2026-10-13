/**
 * PL: Drzwi podtoru 5a (ankieta: głosowanie) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 5a (survey: voting) on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/surveys/vote/routes.ts::surveysVoteApp
 * @uses worker/surveys/vote/deleteStudentData.ts::deleteSurveysStudentData
 * @uses worker/surveys/vote/countParticipations.ts::countSurveyParticipations
 * @uses worker/surveys/vote/listParticipatedSurveys.ts::listParticipatedSurveys
 * @uses worker/surveys/vote/listParticipatedSurveys.ts::ParticipatedSurvey
 * @used_by worker/surveys/index.ts::surveysVoteApp
 * @used_by worker/surveys/index.ts::countSurveyParticipations
 * @used_by worker/surveys/index.ts::listParticipatedSurveys
 */

// PL: Router podtoru 5a.
// EN: The router of subtrack 5a.
export { surveysVoteApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu surveys. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the surveys module. worker/shared/accountDeletion.ts collects it.
export { deleteSurveysStudentData } from './deleteStudentData';

// PL: Liczba udziałów w ankietach dla ekranu panelu Samorządu. Zbiera ją worker/surveys/index.ts.
// EN: The number of survey participations for a screen of the Student Council panel. worker/surveys/index.ts collects it.
export { countSurveyParticipations } from './countParticipations';

// PL: Lista ankiet, w których uczeń brał udział (numer, temat, tytuł, ostatni dzień), bez wyborów odpowiedzi, dla eksportu danych RODO „Pobierz moje dane” (podtor 7). Zbiera ją worker/surveys/index.ts.
// EN: The list of surveys a student took part in (id, label, title, last day), without the answers chosen, for the GDPR data export "Download my data" (subtrack 7). worker/surveys/index.ts collects it.
export { listParticipatedSurveys, type ParticipatedSurvey } from './listParticipatedSurveys';
