/**
 * PL: Polskie nazwy kategorii, miejsc i etapów w panelu zgłoszeń (ekrany 6.4a–6.4d w docs/projekt/EKRANY.md), chipy filtra i opcje kolejności listy. Kody są takie same jak w worker/db/schema/reports.ts; pilnuje tego worker/reports/admin/contract.test.ts. Plik 4a (`reportOptions.ts`) nie jest wystawiony przez drzwi modułu, więc podtor 4b ma własną kopię nazw.
 * EN: The Polish names of categories, places and stages in the reports panel (screens 6.4a–6.4d in docs/projekt/EKRANY.md), the filter chips and the list order options. The codes are the same as in worker/db/schema/reports.ts; worker/reports/admin/contract.test.ts guards this. The 4a file (`reportOptions.ts`) is not exposed through the module door, so subtrack 4b has its own copy of the names.
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/reports/admin/reportView.ts::placeText
 * @used_by src/features/reports/admin/reportView.ts::sortReports
 * @used_by src/features/reports/admin/ReportsList.tsx::FILTERS
 * @used_by src/features/reports/admin/SortPicker.tsx::ORDERS
 * @used_by src/features/reports/admin/ReportDetail.tsx::STAGES
 * @used_by src/features/reports/admin/ReportDetail.tsx::STAGE_NOTE_MAX_LENGTH
 * @used_by worker/reports/admin/contract.test.ts::CATEGORY_LABELS
 * @used_by worker/reports/admin/contract.test.ts::STAGE_NOTE_MAX_LENGTH
 */

/** PL: Nazwy kategorii z ekranu 3.1. EN: The category names of screen 3.1. */
export const CATEGORY_LABELS: Readonly<Record<string, string>> = {
  room_equipment: 'Sala lub sprzęt',
  safety: 'Bezpieczeństwo',
  idea: 'Pomysł',
  other: 'Inne',
};

/** PL: Nazwy miejsc z ekranu 3.2. EN: The place names of screen 3.2. */
export const PLACE_LABELS: Readonly<Record<string, string>> = {
  classroom: 'Sala',
  corridor: 'Korytarz',
  restroom: 'Toaleta',
  locker_room: 'Szatnia',
  gym: 'Sala gimnastyczna',
  field: 'Boisko',
};

/** PL: Etapy od pierwszego do ostatniego, z nazwami z ekranu 3.5. EN: The stages from first to last, with the names of screen 3.5. */
export const STAGES: readonly { code: string; label: string }[] = [
  { code: 'received', label: 'Przyjęte' },
  { code: 'in_progress', label: 'W trakcie' },
  { code: 'resolved', label: 'Załatwione' },
];

/** PL: Wartość filtra „Wszystkie”. EN: The value of the "Wszystkie" filter. */
export const ALL_STAGES = 'all';

/** PL: Chipy filtra z ekranu 6.4a: „Wszystkie” i trzy etapy. EN: The filter chips of screen 6.4a: "Wszystkie" and the three stages. */
export const FILTERS: readonly { code: string; label: string }[] = [{ code: ALL_STAGES, label: 'Wszystkie' }, ...STAGES];

/** PL: Kolejność listy: od najnowszego albo od tych, do których dołączyło najwięcej osób. EN: The order of the list: newest first, or the reports with the most joined people first. */
export type ReportOrder = 'newest' | 'most_joined';

/**
 * PL: Opcje przełącznika kolejności, domyślnie „Najnowsze”. Teksty do uzgodnienia z zespołem (TO_AGREE).
 * EN: The options of the order switch, "Najnowsze" by default. The texts are to be agreed with the team (TO_AGREE).
 */
export const ORDERS: readonly { code: ReportOrder; label: string }[] = [
  { code: 'newest', label: 'Najnowsze' },
  { code: 'most_joined', label: 'Najwięcej osób' },
];

/**
 * PL: Najwięcej znaków w odpowiedzi dla autora przy zmianie etapu. To kopia `MAX_STAGE_NOTE_LENGTH` z worker/db/schema/reports.ts (src nie importuje z worker); worker/reports/admin/contract.test.ts pilnuje, żeby obie wartości były równe.
 * EN: The most characters in the answer for the author when the stage changes. It is a copy of `MAX_STAGE_NOTE_LENGTH` from worker/db/schema/reports.ts (src does not import from worker); worker/reports/admin/contract.test.ts guards that both values are equal.
 */
export const STAGE_NOTE_MAX_LENGTH = 500;
