/**
 * PL: Typy odpowiedzi serwera pulpitu (GET /api/dashboard). Jedna odpowiedź niesie dane wszystkich kafelków, a pole `null` albo pusta lista oznacza pusty kafelek. Telefon ma własną kopię tych typów (src/features/dashboard/types.ts), bo nie importuje plików serwera.
 * EN: The types of the dashboard server answer (GET /api/dashboard). One answer carries the data of all tiles, and a `null` field or an empty list means an empty tile. The phone has its own copy of these types (src/features/dashboard/types.ts), because it does not import server files.
 *
 * @author Kacper
 * @since 2026-10-11
 * @used_by worker/dashboard/summary.ts::summarizeNews
 * @used_by worker/dashboard/routes.ts::dashboardApp
 */

/**
 * PL: Najnowszy wpis typu „Ważne” (kafel „Ważne”).
 * EN: The newest entry of the "Ważne" (important) type (the "Ważne" tile).
 */
export type ImportantEntry = {
  /** PL: Numer wpisu, z niego powstaje adres /news/feed/<id>. EN: The entry id, the /news/feed/<id> address is built from it. */
  id: string;
  /** PL: Tytuł wpisu. EN: The entry title. */
  title: string;
  /** PL: Krótki fragment treści, może być pusty. EN: A short excerpt of the content, may be empty. */
  excerpt: string;
  /** PL: Kto opublikował, na przykład „Sekretariat”. EN: Who published it, for example "Sekretariat". */
  source: string;
  /** PL: Chwila publikacji, tekst ISO 8601. EN: The publication moment, an ISO 8601 text. */
  publishedAt: string;
};

/**
 * PL: Wiersz kafla „Ogłoszenia”: jeden z ostatnich wpisów dowolnego typu.
 * EN: A row of the "Ogłoszenia" (announcements) tile: one of the latest entries of any type.
 */
export type AnnouncementRow = {
  /** PL: Numer wpisu. EN: The entry id. */
  id: string;
  /** PL: Tytuł wpisu. EN: The entry title. */
  title: string;
  /** PL: Chwila publikacji, tekst ISO 8601. EN: The publication moment, an ISO 8601 text. */
  publishedAt: string;
};

/**
 * PL: Ankieta do wypełnienia (kafel „Ankieta”).
 * EN: A survey to fill in (the "Ankieta" tile).
 */
export type DashboardSurvey = {
  /** PL: Numer ankiety, z niego powstaje adres /surveys/vote/<id>. EN: The survey id, the /surveys/vote/<id> address is built from it. */
  id: string;
  /** PL: Tytuł ankiety. EN: The survey title. */
  title: string;
  /** PL: Dni do końca, wliczając dzisiejszy (liczy je moduł ankiet). EN: Days left including today (the surveys module counts them). */
  daysLeft: number;
};

/**
 * PL: Zgłoszenie ucznia na kaflu „Zgłoszenia”.
 * EN: The student's report on the "Zgłoszenia" tile.
 */
export type DashboardReport = {
  /** PL: Treść zgłoszenia, podpis kafla. EN: The report text, the tile caption. */
  description: string;
  /** PL: Numer etapu od 1 do 3: przyjęte, w trakcie, załatwione. EN: The stage number from 1 to 3: received, in progress, resolved. */
  stage: number;
  /** PL: Ile zgłoszeń ucznia nie jest jeszcze załatwionych. EN: How many of the student's reports are not resolved yet. */
  openCount: number;
};

/**
 * PL: Cała odpowiedź pulpitu.
 * EN: The whole dashboard answer.
 */
export type DashboardData = {
  /** PL: Najnowszy wpis „Ważne” albo null, gdy takiego nie ma. EN: The newest "Ważne" entry, or null when there is none. */
  important: ImportantEntry | null;
  /** PL: Do trzech ostatnich wpisów, od najnowszego. EN: Up to three latest entries, newest first. */
  announcements: AnnouncementRow[];
  /** PL: Ankieta do wypełnienia albo null. EN: A survey to fill in, or null. */
  survey: DashboardSurvey | null;
  /** PL: Zgłoszenie ucznia albo null. EN: The student's report, or null. */
  report: DashboardReport | null;
};
