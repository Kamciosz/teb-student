/**
 * PL: Logika widoku panelu bez rysowania: który wiersz widzi jaka rola, jak brzmi podpis roli, jak porównać role i jak wygląda data końca kodu. Teksty są z docs/projekt/EKRANY.md, przepływ 6 (ekrany 6.1a–6.1c, 6.2b).
 * EN: The panel view logic without drawing: which row each role sees, how the role caption reads, when a screen is allowed and what the code end date looks like. The texts come from docs/projekt/EKRANY.md, flow 6 (screens 6.1a–6.1c, 6.2b).
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/admin/PanelHome.tsx::sectionsFor
 * @used_by src/features/admin/PanelHome.tsx::pilotSectionsFor
 * @used_by src/features/admin/PanelGate.tsx::isLevelEnough
 * @used_by src/features/admin/InvitesScreen.tsx::formatInviteEnd
 * @used_by src/features/admin/queries.ts::panelEntryFor
 * @used_by src/features/admin/panelView.test.ts::PANEL_SECTIONS
 */

// PL: Typ roli z modułu api.
// EN: The role type from the api module.
import type { PanelLevel } from './api';
// PL: Nazwa ikony, bo część panelu ma ikonę.
// EN: The icon name, because a panel section has an icon.
import type { IconName } from './icons';

/**
 * PL: Jedna część panelu na ekranie głównym (6.1b): wiersz z ikoną, tytułem i opisem.
 * EN: One panel section on the main screen (6.1b): a row with an icon, a title and a description.
 */
export type PanelSection = {
  /** PL: Adres ekranu części w aplikacji. EN: The address of the section screen in the app. */
  to: string;
  /** PL: Tytuł wiersza. EN: The row title. */
  title: string;
  /** PL: Opis pod tytułem. EN: The description under the title. */
  hint: string;
  /** PL: Ikona wiersza. EN: The row icon. */
  icon: IconName;
  /** PL: Najniższa rola, która widzi wiersz. EN: The lowest role that sees the row. */
  minimum: PanelLevel;
  /** PL: Znacznik przy tytule wiersza (tylko przy „Role”: „Administrator”). EN: The badge next to the row title (only for "Role": "Administrator"). */
  badge?: string;
};

/**
 * PL: Części panelu w kolejności z ekranu 6.1b, w jednym kafelku. Redakcja widzi tylko Wpisy, Samorząd cztery pierwsze, administrator także „Role”.
 * EN: The panel sections in the order of screen 6.1b, in one tile. The editorial team sees only Entries, the Council the first four, the administrator also "Role".
 */
export const PANEL_SECTIONS: readonly PanelSection[] = [
  { to: '/news/admin', title: 'Wpisy', hint: 'Pisz i publikuj aktualności.', icon: 'newspaper', minimum: 'editor' },
  { to: '/reports/admin', title: 'Zgłoszenia', hint: 'Zmieniaj etap zgłoszeń.', icon: 'clipboard-list', minimum: 'council' },
  { to: '/surveys/admin', title: 'Ankiety', hint: 'Twórz ankiety i czytaj wyniki.', icon: 'chart-column', minimum: 'council' },
  { to: '/admin/kody', title: 'Kody zaproszeń', hint: 'Wydaj kod osobie bez szkolnej skrzynki.', icon: 'ticket', minimum: 'council' },
  { to: '/admin/role', title: 'Role', hint: 'Nadaj albo odbierz rolę Samorządu i redakcji.', icon: 'users', minimum: 'admin', badge: 'Administrator' },
];

/**
 * PL: Części pod etykietą „Pilotaż” (ekran 6.1b), w osobnym kafelku. Widzi je tylko administrator.
 * EN: The sections under the "Pilotaż" label (screen 6.1b), in a separate tile. Only the administrator sees them.
 */
export const PILOT_SECTIONS: readonly PanelSection[] = [
  { to: '/admin/pilotaz', title: 'Dane z pilotażu', hint: 'Pobierz liczby bez imion, nazwisk i adresów.', icon: 'download', minimum: 'admin' },
];

/** PL: Kolejność ról od najniższej do najwyższej, tak jak na serwerze. EN: The roles from the lowest to the highest, as on the server. */
const LEVELS: readonly PanelLevel[] = ['editor', 'council', 'admin'];

/**
 * PL: Sprawdza, czy rola wystarcza do poziomu minimalnego.
 * EN: Checks whether a role is enough for the minimum level.
 *
 * @param level - PL: rola ucznia. EN: the student's role.
 * @param minimum - PL: najniższa rola, która wystarcza. EN: the lowest role that is enough.
 * @returns PL: true, gdy rola wystarcza. EN: true when the role is enough.
 */
export function isLevelEnough(level: PanelLevel, minimum: PanelLevel): boolean {
  // PL: Rola wystarcza, gdy stoi w kolejności nie niżej niż minimalna.
  // EN: A role is enough when it stands in the order no lower than the minimum.
  return LEVELS.indexOf(level) >= LEVELS.indexOf(minimum);
}

/**
 * PL: Wybiera części panelu, które widzi rola.
 * EN: Picks the panel sections a role sees.
 *
 * @param level - PL: rola ucznia. EN: the student's role.
 * @returns PL: lista części w kolejności ekranu. EN: the list of sections in screen order.
 */
export function sectionsFor(level: PanelLevel): PanelSection[] {
  // PL: Zostaw tylko wiersze, do których rola wystarcza.
  // EN: Keep only the rows the role is enough for.
  return PANEL_SECTIONS.filter((section) => isLevelEnough(level, section.minimum));
}

/**
 * PL: Wybiera wiersze pilotażu, które widzi rola (tylko administrator).
 * EN: Picks the pilot rows a role sees (only the administrator).
 *
 * @param level - PL: rola ucznia. EN: the student's role.
 * @returns PL: lista wierszy pilotażu. EN: the list of pilot rows.
 */
export function pilotSectionsFor(level: PanelLevel): PanelSection[] {
  // PL: Ta sama reguła co dla głównego kafla, tylko z listy pilotażu.
  // EN: The same rule as for the main tile, only on the pilot list.
  return PILOT_SECTIONS.filter((section) => isLevelEnough(level, section.minimum));
}

/**
 * PL: Podpis roli pod tytułem panelu (ekrany 6.1b i 6.1c).
 * EN: The role caption under the panel title (screens 6.1b and 6.1c).
 *
 * @param level - PL: rola ucznia. EN: the student's role.
 * @returns PL: tekst, na przykład „Twoja rola: Samorząd”. EN: the text, for example "Twoja rola: Samorząd".
 */
export function roleCaption(level: PanelLevel): string {
  // PL: Nazwy ról jak w projekcie: administrator małą literą, Samorząd wielką, redakcja z dopiskiem.
  // EN: The role names as in the design: administrator in lowercase, Samorząd in capitals, the editorial team with a suffix.
  const names: Record<PanelLevel, string> = { admin: 'administrator', council: 'Samorząd', editor: 'redakcja gazetki' };
  return `Twoja rola: ${names[level]}`;
}

/**
 * PL: Wiersz wejścia do panelu w profilu (ekran 6.1a): nazwa wiersza i znacznik.
 * EN: The panel entry row in the profile (screen 6.1a): the row name and the badge.
 */
export type PanelEntry = {
  /** PL: Nazwa wiersza: „Panel Samorządu” albo „Panel redakcji”. EN: The row name: "Panel Samorządu" or "Panel redakcji". */
  label: string;
  /** PL: Znacznik przed strzałką: „Samorząd”, „Redakcja” albo „Administrator”. EN: The badge before the arrow: "Samorząd", "Redakcja" or "Administrator". */
  badge: string;
};

/**
 * PL: Układa wiersz wejścia do panelu dla roli.
 * EN: Builds the panel entry row for a role.
 *
 * @param level - PL: rola ucznia albo null. EN: the student's role or null.
 * @returns PL: wiersz albo null, gdy uczeń nie ma roli (wtedy profil nie pokazuje wiersza). EN: the row or null when the student has no role (the profile then shows no row).
 */
export function panelEntryFor(level: PanelLevel | null): PanelEntry | null {
  // PL: Uczeń bez roli nie ma wiersza.
  // EN: A student without a role has no row.
  if (level === null) return null;
  // PL: Redakcja ma „Panel redakcji”, pozostałe role „Panel Samorządu”, ze znacznikiem swojej roli.
  // EN: The editorial team has "Panel redakcji", the other roles "Panel Samorządu", with a badge of their role.
  const badges: Record<PanelLevel, string> = { admin: 'Administrator', council: 'Samorząd', editor: 'Redakcja' };
  return { label: level === 'editor' ? 'Panel redakcji' : 'Panel Samorządu', badge: badges[level] };
}

/**
 * PL: Zamienia datę końca ważności kodu na zapis „26.10.2026” w czasie telefonu.
 * EN: Turns a code expiry date into the text "26.10.2026" in the phone's time.
 *
 * @param isoDate - PL: data w formacie ISO z serwera. EN: the date in ISO format from the server.
 * @returns PL: dzień.miesiąc.rok. EN: day.month.year.
 */
export function formatInviteEnd(isoDate: string): string {
  // PL: Rozbij datę na dzień, miesiąc i rok w czasie telefonu. Dzień i miesiąc dopełniamy zerem do dwóch cyfr, jak w projekcie.
  // EN: Split the date into day, month and year in the phone's time. We pad the day and month with a zero to two digits, as in the design.
  const date = new Date(isoDate);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${day}.${month}.${date.getFullYear()}`;
}
