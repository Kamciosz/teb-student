/**
 * PL: Kolejność sekcji pulpitu „Do zrobienia” i „Informacje” (wzór: sekcje ustawień w iOS). Uczeń układa sekcje przyciskami „Wyżej” i „Niżej”, a wybór zostaje w pamięci telefonu. Zapis, który nie pasuje (uszkodzony, stary albo z nieznaną sekcją), nie psuje pulpitu: nieznane sekcje są pomijane, a brakujące dokładane na końcu w domyślnej kolejności.
 * EN: The order of the dashboard sections "Do zrobienia" and "Informacje" (the iOS settings sections pattern). The student arranges the sections with the "Wyżej" and "Niżej" buttons, and the choice stays in the phone storage. A saved value that does not fit (broken, old, or with an unknown section) does not break the dashboard: unknown sections are skipped, and missing ones are added at the end in the default order.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @used_by src/features/dashboard/DashboardScreen.tsx::DashboardScreen
 * @used_by src/features/dashboard/Sections.tsx::Sections
 * @used_by src/features/dashboard/tileOrder.test.ts::sortSections
 */

/** PL: Sekcje pulpitu w domyślnej kolejności. EN: The dashboard sections in the default order. */
export const SECTION_IDS = ['zrobienia', 'informacje'] as const;

/** PL: Identyfikator sekcji. EN: A section identifier. */
export type SectionId = (typeof SECTION_IDS)[number];

/** PL: Nazwy sekcji na przyciskach i w opisach. EN: The section names on the buttons and in the labels. */
export const SECTION_NAMES: Record<SectionId, string> = {
  zrobienia: 'Do zrobienia',
  informacje: 'Informacje',
};

/** PL: Klucz w pamięci telefonu, pod którym leży zapisana kolejność. EN: The key in the phone storage under which the saved order lies. */
export const SECTION_ORDER_STORAGE_KEY = 'teb-student-dashboard-section-order';

/** PL: Pamięć, z której czytamy i do której zapisujemy kolejność: w aplikacji localStorage. EN: The storage the order is read from and saved to: localStorage in the app. */
export type SectionOrderStorage = Pick<Storage, 'getItem' | 'setItem'>;

/**
 * PL: Sprawdza, czy wartość to identyfikator znanej sekcji.
 * EN: Checks whether the value is the identifier of a known section.
 *
 * @param value - PL: wartość z zapisu. EN: the value from the storage.
 * @returns PL: true dla znanej sekcji. EN: true for a known section.
 */
export function isSectionId(value: unknown): value is SectionId {
  return typeof value === 'string' && (SECTION_IDS as readonly string[]).includes(value);
}

/**
 * PL: Układa sekcje według zapisanej listy: nieznane i powtórzone pomija, a brakujące dokłada na końcu w domyślnej kolejności. Gdy zapis nie jest listą, zwraca domyślną kolejność.
 * EN: Arranges the sections by the saved list: skips unknown and repeated ones, and adds the missing ones at the end in the default order. When the saved value is not a list, returns the default order.
 *
 * @param saved - PL: wartość z zapisu, po JSON.parse. EN: the saved value, after JSON.parse.
 * @returns PL: pełna lista sekcji bez powtórzeń. EN: the full list of sections without repeats.
 */
export function sortSections(saved: unknown): SectionId[] {
  const picked: SectionId[] = [];
  if (Array.isArray(saved)) {
    for (const value of saved) {
      if (isSectionId(value) && !picked.includes(value)) picked.push(value);
    }
  }
  return [...picked, ...SECTION_IDS.filter((id) => !picked.includes(id))];
}

/**
 * PL: Zwraca localStorage, albo undefined poza przeglądarką lub gdy przeglądarka go blokuje (samo odczytanie potrafi rzucić błąd).
 * EN: Returns localStorage, or undefined outside a browser or when the browser blocks it (merely reading it can throw).
 *
 * @returns PL: pamięć albo undefined. EN: the storage or undefined.
 */
function browserStorage(): SectionOrderStorage | undefined {
  try {
    return typeof window === 'undefined' ? undefined : window.localStorage;
  } catch {
    return undefined;
  }
}

/**
 * PL: Odczytuje zapisaną kolejność. Gdy zapis jest uszkodzony albo pamięć rzuca błąd, zwraca domyślną kolejność i nie przerywa pulpitu.
 * EN: Reads the saved order. When the saved value is broken or the storage throws, returns the default order and does not stop the dashboard.
 *
 * @param storage - PL: pamięć do odczytu, domyślnie localStorage. EN: the storage to read from, localStorage by default.
 * @returns PL: kolejność sekcji. EN: the order of the sections.
 */
export function loadSectionOrder(storage: SectionOrderStorage | undefined = browserStorage()): SectionId[] {
  try {
    const raw = storage?.getItem(SECTION_ORDER_STORAGE_KEY) ?? null;
    return sortSections(raw === null ? null : JSON.parse(raw));
  } catch {
    return sortSections(null);
  }
}

/**
 * PL: Zapisuje kolejność w pamięci telefonu. Gdy zapis się nie udaje (pełna pamięć, zablokowany localStorage), kolejność działa do odświeżenia, a pulpit się nie psuje.
 * EN: Saves the order in the phone storage. When the save fails (full storage, blocked localStorage), the order works until a refresh, and the dashboard does not break.
 *
 * @param order - PL: kolejność do zapisania. EN: the order to save.
 * @param storage - PL: pamięć do zapisu, domyślnie localStorage. EN: the storage to save to, localStorage by default.
 */
export function saveSectionOrder(order: readonly SectionId[], storage: SectionOrderStorage | undefined = browserStorage()): void {
  try {
    storage?.setItem(SECTION_ORDER_STORAGE_KEY, JSON.stringify(order));
  } catch {
    // PL: Nic nie robimy: kolejność zostaje w pamięci ekranu do odświeżenia.
    // EN: We do nothing: the order stays in the screen memory until a refresh.
  }
}

/**
 * PL: Przesuwa sekcję o jedno miejsce w górę (-1) albo w dół (1). Na krawędzi nic nie robi.
 * EN: Moves a section one place up (-1) or down (1). On the edge it does nothing.
 *
 * @param order - PL: bieżąca kolejność. EN: the current order.
 * @param id - PL: sekcja do przesunięcia. EN: the section to move.
 * @param step - PL: -1 w górę, 1 w dół. EN: -1 up, 1 down.
 * @returns PL: nowa kolejność (nowa tablica). EN: the new order (a new array).
 */
export function moveSection(order: readonly SectionId[], id: SectionId, step: -1 | 1): SectionId[] {
  const from = order.indexOf(id);
  const to = from + step;
  const next = [...order];
  if (from === -1 || to < 0 || to >= next.length) return next;
  [next[from], next[to]] = [next[to], next[from]];
  return next;
}
