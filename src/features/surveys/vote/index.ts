/**
 * PL: Drzwi podtoru 5a (ankieta: głosowanie) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 5a (survey: voting) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/surveys/vote/SurveysVoteScreen.tsx::SurveysVoteScreen
 * @used_by src/features/surveys/index.ts::SurveysVoteScreen
 */

// PL: Ekran podtoru 5a.
// EN: The screen of subtrack 5a.
export { SurveysVoteScreen } from './SurveysVoteScreen';
