/**
 * PL: Napis „Brak internetu” z informacją, od kiedy dane są stare. Sam napis, bez czytania sieci: czy pokazać go i od kiedy, rozstrzyga OfflineBanner. Tekst jest z planu (docs/PLAN_APLIKACJI.md, „Działanie bez internetu”), bo docs/projekt/EKRANY.md nie ma jeszcze tekstu o braku internetu (pytanie w pull requeście).
 * EN: The "Brak internetu" (no internet) label with the time since which the data is stale. Only the label, with no network reading: OfflineBanner decides whether to show it and since when. The text comes from the plan (docs/PLAN_APLIKACJI.md, "Działanie bez internetu"), because docs/projekt/EKRANY.md has no no-internet text yet (a question in the pull request).
 *
 * @author Bohdan
 * @since 2026-10-09
 * @used_by src/shared/ui/OfflineBanner.tsx::OfflineBanner
 */

/**
 * PL: Dane napisu o braku internetu.
 * EN: Data of the no-internet label.
 */
export type OfflineNoticeProps = {
  /** PL: Chwila ostatniego pobrania danych (milisekundy od 1970) albo null, gdy telefon nic jeszcze nie pobrał. EN: The moment of the last data fetch (milliseconds since 1970) or null when the phone has fetched nothing yet. */
  staleSince: number | null;
};

/**
 * PL: Zamienia chwilę na krótki zapis w czasie telefonu, na przykład „9.10, 14:05”.
 * EN: Turns a moment into a short text in the phone's time, for example "9.10, 14:05".
 *
 * @param timestamp - PL: milisekundy od 1970. EN: milliseconds since 1970.
 * @returns PL: dzień.miesiąc, godzina:minuta. EN: day.month, hour:minute.
 */
export function formatStaleSince(timestamp: number): string {
  // PL: Czas lokalny telefonu, bo uczeń zna swoją godzinę, nie UTC.
  // EN: The phone's local time, because the student knows their own hour, not UTC.
  const date = new Date(timestamp);
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${date.getDate()}.${date.getMonth() + 1}, ${date.getHours()}:${minutes}`;
}

/**
 * PL: Rysuje napis „Brak internetu”. Gdy jest chwila ostatniego pobrania, dopisuje, od kiedy dane są stare.
 * EN: Draws the "Brak internetu" label. When there is a last-fetch moment, it adds since when the data is stale.
 *
 * @param props - PL: chwila ostatniego pobrania. EN: the last-fetch moment.
 * @returns PL: drzewo elementów napisu. EN: the tree of label elements.
 */
export function OfflineNotice({ staleSince }: OfflineNoticeProps) {
  // PL: role="status" sprawia, że czytnik ekranu ogłasza napis, gdy się pojawi.
  // EN: role="status" makes a screen reader announce the label when it appears.
  return (
    <div role="status" data-offline-notice>
      <strong>Brak internetu</strong>
      {/* PL: Bez pobranych danych nie ma od kiedy liczyć, więc zostaje sam napis. EN: With no fetched data there is nothing to count from, so only the label stays. */}
      {staleSince === null ? null : <span>{` Dane z ${formatStaleSince(staleSince)}.`}</span>}
    </div>
  );
}
