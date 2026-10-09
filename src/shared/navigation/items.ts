/**
 * PL: Wpisy dolnego paska i menu panelu Samorządu. Tu jest jedyna lista, więc agent modułu niczego nie dopisuje. Teksty pochodzą z docs/projekt/EKRANY.md.
 * EN: The entries of the bottom bar and of the Student Council panel menu. This is the only list, so a module agent adds nothing. The texts come from docs/projekt/EKRANY.md.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by src/shared/ui/Dock.tsx::Dock
 * @used_by src/features/admin/AdminLayout.tsx::AdminLayout
 * @used_by src/shared/index.ts::DOCK_ITEMS
 */

/**
 * PL: Jeden wpis nawigacji: dokąd prowadzi i jak się nazywa.
 * EN: One navigation entry: where it leads and what it is called.
 */
export type NavigationItem = {
  /** PL: Adres ekranu w aplikacji, zgodny z listą w src/app/routes.ts. EN: The screen address in the app, matching the list in src/app/routes.ts. */
  path: string;
  /** PL: Napis, który widzi uczeń. Dla przycisku „+” w dolnym pasku to opis dla czytnika ekranu. EN: The text the student sees. For the "+" button in the bottom bar it is the screen reader description. */
  label: string;
};

/**
 * PL: Dolny pasek: Pulpit, przycisk „+” prowadzący do zgłoszenia i Ankiety. Kolejność jak w docs/projekt/referencje/uklad_C.html.
 * EN: The bottom bar: Dashboard, the "+" button leading to a report, and Surveys. The order follows docs/projekt/referencje/uklad_C.html.
 */
export const DOCK_ITEMS: readonly NavigationItem[] = [
  // PL: Pulpit, ekran startowy (podtor 9). EN: The dashboard, the start screen (subtrack 9).
  { path: '/', label: 'Pulpit' },
  // PL: Zgłoszenie problemu (podtor 4a), w makiecie przycisk „+” z opisem „Zgłoś problem”. EN: Reporting a problem (subtrack 4a), in the mockup the "+" button labelled "Zgłoś problem".
  { path: '/reports/student', label: 'Zgłoś problem' },
  // PL: Lista ankiet (podtor 5a). EN: The survey list (subtrack 5a).
  { path: '/surveys/vote', label: 'Ankiety' },
];

/**
 * PL: Menu panelu Samorządu: po jednym wpisie na podtor, który ma ekran w panelu. W docs/projekt/EKRANY.md nie ma menu panelu, więc nazwy są z najbliższych ekranów: „Aktualności”, „Zgłoszenia”, „Ankiety”. Dla podtoru 8 (kody zaproszeń) najbliższy napis to „Kod zaproszenia”. Do potwierdzenia przez Szymona.
 * EN: The Student Council panel menu: one entry per subtrack that has a screen in the panel. docs/projekt/EKRANY.md has no panel menu, so the names come from the nearest screens: "Aktualności", "Zgłoszenia", "Ankiety". For subtrack 8 (invitation codes) the nearest text is "Kod zaproszenia". To be confirmed by Szymon.
 */
export const PANEL_MENU_ITEMS: readonly NavigationItem[] = [
  // PL: Wpisy w panelu (podtor 3c). EN: Entries in the panel (subtrack 3c).
  { path: '/news/admin', label: 'Aktualności' },
  // PL: Zgłoszenia w panelu (podtor 4b). EN: Reports in the panel (subtrack 4b).
  { path: '/reports/admin', label: 'Zgłoszenia' },
  // PL: Ankiety w panelu (podtor 5b). EN: Surveys in the panel (subtrack 5b).
  { path: '/surveys/admin', label: 'Ankiety' },
  // PL: Rama panelu, kody zaproszeń i role (podtor 8). EN: The panel frame, invitation codes and roles (subtrack 8).
  { path: '/admin', label: 'Kod zaproszenia' },
];
