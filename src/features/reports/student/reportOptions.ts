/**
 * PL: Listy wyborów formularza zgłoszenia: kategorie, miejsca i etapy z polskimi nazwami z docs/projekt/EKRANY.md (ekrany 3.1, 3.2 i 3.5). Kody są takie same jak w worker/db/schema/reports.ts; pilnuje tego worker/reports/student/contract.test.ts.
 * EN: The choice lists of the report form: categories, places and stages with the Polish names from docs/projekt/EKRANY.md (screens 3.1, 3.2 and 3.5). The codes are the same as in worker/db/schema/reports.ts; worker/reports/student/contract.test.ts guards this.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/reports/student/ReportForm.tsx::CATEGORY_OPTIONS
 * @used_by src/features/reports/student/ReportForm.tsx::PLACE_OPTIONS
 * @used_by src/features/reports/student/MyReports.tsx::categoryLabel
 * @used_by src/features/reports/student/reportView.ts::STAGE_ORDER
 */

/** PL: Najwięcej znaków w opisie; tyle samo przyjmuje serwer. EN: The most characters in the description; the server accepts the same. */
export const MAX_DESCRIPTION_LENGTH = 500;

/** PL: Najwięcej znaków w dokładnym miejscu; tyle samo przyjmuje serwer. EN: The most characters in the exact place; the server accepts the same. */
export const MAX_PLACE_DETAIL_LENGTH = 60;

/** PL: Nazwa ikony z icons.tsx. EN: The icon name from icons.tsx. */
export type CategoryIcon = 'wrench' | 'shield-alert' | 'lightbulb' | 'circle-help';

/** PL: Jedna kategoria zgłoszenia. EN: One report category. */
export type CategoryOption = {
  /** PL: Kod wysyłany na serwer. EN: The code sent to the server. */
  code: string;
  /** PL: Napis na karcie. EN: The label on the card. */
  label: string;
  /** PL: Ikona karty. EN: The card icon. */
  icon: CategoryIcon;
};

/** PL: Cztery kategorie z ekranu 3.1. EN: The four categories of screen 3.1. */
export const CATEGORY_OPTIONS: readonly CategoryOption[] = [
  { code: 'room_equipment', label: 'Sala lub sprzęt', icon: 'wrench' },
  { code: 'safety', label: 'Bezpieczeństwo', icon: 'shield-alert' },
  { code: 'idea', label: 'Pomysł', icon: 'lightbulb' },
  { code: 'other', label: 'Inne', icon: 'circle-help' },
];

/** PL: Sześć miejsc z ekranu 3.2. EN: The six places of screen 3.2. */
export const PLACE_OPTIONS: readonly { code: string; label: string }[] = [
  { code: 'classroom', label: 'Sala' },
  { code: 'corridor', label: 'Korytarz' },
  { code: 'restroom', label: 'Toaleta' },
  { code: 'locker_room', label: 'Szatnia' },
  { code: 'gym', label: 'Sala gimnastyczna' },
  { code: 'field', label: 'Boisko' },
];

/** PL: Etapy zgłoszenia od pierwszego do ostatniego, z podpisami z ekranu 3.5. EN: The report stages from first to last, with the captions of screen 3.5. */
export const STAGE_ORDER: readonly { code: string; label: string }[] = [
  { code: 'received', label: 'Przyjęte' },
  { code: 'in_progress', label: 'W trakcie' },
  { code: 'resolved', label: 'Załatwione' },
];

/**
 * PL: Podaje nazwę kategorii do znacznika na kafelku.
 * EN: Gives the category name for the tag on a tile.
 *
 * @param code - PL: kod kategorii z serwera. EN: the category code from the server.
 * @returns PL: polska nazwa albo sam kod, gdy serwer wyśle nieznany. EN: the Polish name, or the code itself when the server sends an unknown one.
 */
export function categoryLabel(code: string): string {
  // PL: Znajdź kategorię po kodzie; nieznany kod pokazujemy bez zmian, żeby nic nie zniknęło.
  // EN: Find the category by code; an unknown code is shown as is, so nothing disappears.
  return CATEGORY_OPTIONS.find((option) => option.code === code)?.label ?? code;
}
