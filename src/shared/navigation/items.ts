/**
 * PL: Wpisy dolnego paska i menu panelu Samorządu. Tu jest jedyna lista, więc agent modułu niczego nie dopisuje. Teksty pochodzą z docs/projekt/EKRANY.md.
 * EN: The entries of the bottom bar and of the Student Council panel menu. This is the only list, so a module agent adds nothing. The texts come from docs/projekt/EKRANY.md.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by src/shared/ui/Dock.tsx::Dock
 * @used_by src/features/admin/AdminLayout.tsx::AdminLayout
 * @uses src/shared/ui/Icon.tsx::IconName
 * @used_by src/shared/index.ts::DOCK_ITEMS
 */

// PL: Nazwa ikony dla pozycji dolnego paska.
// EN: The icon name for a bottom bar entry.
import type { IconName } from '../ui/Icon';

/**
 * PL: Jeden wpis nawigacji: dokąd prowadzi i jak się nazywa.
 * EN: One navigation entry: where it leads and what it is called.
 */
export type NavigationItem = {
  /** PL: Adres ekranu w aplikacji, zgodny z listą w src/app/routes.ts. EN: The screen address in the app, matching the list in src/app/routes.ts. */
  path: string;
  /** PL: Napis, który widzi uczeń (w dolnym pasku także nazwa dla czytnika ekranu). EN: The text the student sees (in the bottom bar also the name for the screen reader). */
  label: string;
};

/**
 * PL: Pozycja dolnego paska: jak w zwykłym wpisie, plus nazwa ikony nad napisem.
 * EN: A bottom bar entry: like a plain entry, plus the icon name shown above the label.
 */
export type DockItem = NavigationItem & {
  /** PL: Ikona z zestawu src/shared/ui/Icon.tsx. EN: The icon from the set in src/shared/ui/Icon.tsx. */
  icon: IconName;
};

/**
 * PL: Dolny pasek: Pulpit, Aktualności, Zgłoszenia, Ankiety i Profil, w tej kolejności. Pięć równych pozycji, bez przycisku dodawania.
 * EN: The bottom bar: Dashboard, News, Reports, Surveys and Profile, in this order. Five equal entries, with no add button.
 */
export const DOCK_ITEMS: readonly DockItem[] = [
  // PL: Pulpit, ekran startowy (podtor 9). EN: The dashboard, the start screen (subtrack 9).
  { path: '/', label: 'Pulpit', icon: 'layout-dashboard' },
  // PL: Aktualności, lista wpisów (podtor 3a). EN: News, the list of entries (subtrack 3a).
  { path: '/news/feed', label: 'Aktualności', icon: 'newspaper' },
  // PL: Zgłaszanie problemów (podtor 4a). EN: Reporting problems (subtrack 4a).
  { path: '/reports/student', label: 'Zgłoszenia', icon: 'clipboard-list' },
  // PL: Lista ankiet (podtor 5a). EN: The survey list (subtrack 5a).
  { path: '/surveys/vote', label: 'Ankiety', icon: 'list-checks' },
  // PL: Profil ucznia (podtor 7). EN: The student profile (subtrack 7).
  { path: '/profile', label: 'Profil', icon: 'user-round' },
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
