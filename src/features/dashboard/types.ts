/**
 * PL: Typy odpowiedzi serwera pulpitu (GET /api/dashboard) widziane przez telefon. To kopia typów z worker/dashboard/types.ts, bo telefon nie importuje plików serwera. Pole `null` albo pusta lista oznacza pusty kafelek.
 * EN: The types of the dashboard server answer (GET /api/dashboard) as seen by the phone. This is a copy of the types from worker/dashboard/types.ts, because the phone does not import server files. A `null` field or an empty list means an empty tile.
 *
 * @author Kacper
 * @since 2026-10-11
 * @used_by src/features/dashboard/api.ts::fetchDashboard
 * @used_by src/features/dashboard/ImportantTile.tsx::ImportantTile
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
 * PL: Wiersz kafla „Ogłoszenia”.
 * EN: A row of the "Ogłoszenia" (announcements) tile.
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
  /** PL: Dni do końca, wliczając dzisiejszy. EN: Days left including today. */
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
  /** PL: Najnowszy wpis „Ważne” albo null. EN: The newest "Ważne" entry, or null. */
  important: ImportantEntry | null;
  /** PL: Do trzech ostatnich wpisów, od najnowszego. EN: Up to three latest entries, newest first. */
  announcements: AnnouncementRow[];
  /** PL: Ankieta do wypełnienia albo null. EN: A survey to fill in, or null. */
  survey: DashboardSurvey | null;
  /** PL: Zgłoszenie ucznia albo null. EN: The student's report, or null. */
  report: DashboardReport | null;
};
