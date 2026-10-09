/**
 * PL: Drzwi modułu surveys po stronie telefonu. Tylko zbiera index.ts jego podtorów (5a, 5b) i niczego nie zawiera. Router importuje tylko stąd.
 * EN: The door of the surveys module on the phone side. It only collects the index.ts files of its subtracks (5a, 5b) and contains nothing itself. The router imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/surveys/vote/index.ts::SurveysVoteScreen
 * @uses src/features/surveys/admin/index.ts::SurveysAdminScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 5a (ankieta: głosowanie).
// EN: The screen of subtrack 5a (survey: voting).
export { SurveysVoteScreen } from './vote';

// PL: Ekran podtoru 5b (ankiety w panelu: tworzenie i wyniki).
// EN: The screen of subtrack 5b (surveys in the panel: creating and results).
export { SurveysAdminScreen } from './admin';
