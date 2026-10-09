/**
 * PL: Drzwi podtoru 5b (ankiety w panelu: tworzenie i wyniki) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 5b (surveys in the panel: creating and results) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/surveys/admin/SurveysAdminScreen.tsx::SurveysAdminScreen
 * @used_by src/features/surveys/index.ts::SurveysAdminScreen
 */

// PL: Ekran podtoru 5b.
// EN: The screen of subtrack 5b.
export { SurveysAdminScreen } from './SurveysAdminScreen';
