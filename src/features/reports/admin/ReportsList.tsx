/**
 * PL: Ekrany 6.4a i 6.4d: lista zgłoszeń od najnowszego z filtrem po etapie, ze stanem pustym i błędem pobrania. Przy zgłoszeniu anonimowym stoi napis „Zgłoszenie anonimowe”. Filtr działa w telefonie na pobranej liście, więc działa też bez internetu.
 * EN: Screens 6.4a and 6.4d: the report list, newest first, with the stage filter, the empty state and the fetch error. An anonymous report shows the "Zgłoszenie anonimowe" label. The filter works on the phone on the fetched list, so it works offline too.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/queries.ts::useAdminReports
 * @uses src/features/reports/admin/reportView.ts::filterByStage
 * @used_by src/features/reports/admin/ReportsAdminScreen.tsx::ReportsList
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { Icon } from './icons';
import { Notice } from './Notice';
import { PanelTop } from './PanelTop';
import type { AdminReport } from './api';
import { useAdminReports } from './queries';
import { ALL_STAGES, FILTERS } from './reportLabels';
import { categoryLabel, filterByStage, formatShortDate, placeText, stageLabel } from './reportView';

/**
 * PL: Rysuje jeden kafel zgłoszenia, który prowadzi do szczegółu (ekran 6.4b).
 * EN: Draws one report tile that leads to the detail (screen 6.4b).
 *
 * @param props - PL: zgłoszenie do pokazania. EN: the report to show.
 * @returns PL: drzewo elementów kafla. EN: the tree of tile elements.
 */
function ReportTile({ report }: { report: AdminReport }) {
  // PL: Cały kafel jest linkiem do szczegółu: znacznik kategorii, data z miejscem, opis, napis o anonimowości i znacznik etapu.
  // EN: The whole tile is a link to the detail: the category tag, the date with the place, the description, the anonymity label and the stage tag.
  return (
    <li>
      <Link className="ra-tile" to={report.id}>
        <span className="ra-tile-head">
          <span className="ra-tag">{categoryLabel(report.category)}</span>
          <span className="ra-small">{formatShortDate(report.createdAt)} · {placeText(report)}</span>
        </span>
        <span className="ra-desc">{report.description}</span>
        <span className="ra-tile-foot">
          <span className="ra-small">{report.isAnonymous ? 'Zgłoszenie anonimowe' : null}</span>
          <span className="ra-tag ra-tag-stage">{stageLabel(report.stage)}</span>
        </span>
      </Link>
    </li>
  );
}

/**
 * PL: Rysuje pusty stan (ekran 6.4d). Z wybranym etapem tekst jest inny niż wtedy, gdy nikt nic nie zgłosił.
 * EN: Draws the empty state (screen 6.4d). With a stage chosen the text differs from when nobody has reported anything.
 *
 * @param props - PL: czy filtr ogranicza do etapu. EN: whether the filter restricts to a stage.
 * @returns PL: drzewo elementów. EN: the tree of elements.
 */
function EmptyState({ isFiltered }: { isFiltered: boolean }) {
  // PL: Z wybranym etapem tekst mówi o etapie, bez filtra o tym, że nikt nic nie zgłosił.
  // EN: With a stage chosen the text speaks of the stage, without a filter it says nobody reported anything.
  return (
    <div className="ra-empty">
      <Icon name="inbox" />
      <h2>{isFiltered ? 'Brak zgłoszeń w tym etapie' : 'Nikt jeszcze nic nie zgłosił'}</h2>
      <p>{isFiltered ? 'Gdy zgłoszenie zmieni etap, pojawi się tutaj.' : 'Zgłoszenia uczniów pojawią się tutaj.'}</p>
    </div>
  );
}

/**
 * PL: Rysuje treść pod chipami: listę, pusty stan, błąd albo wczytywanie. Zapisana lista ma pierwszeństwo, więc przy błędzie sieci Samorząd nadal ją widzi.
 * EN: Draws the body under the chips: the list, the empty state, the error or the loading. The saved list takes priority, so with a network error the Student Council still sees it.
 *
 * @param props - PL: wynik zapytania i wybrany filtr. EN: the query result and the chosen filter.
 * @returns PL: drzewo elementów treści. EN: the tree of body elements.
 */
function ListBody({ query, filter }: { query: ReturnType<typeof useAdminReports>; filter: string }) {
  // PL: Dane (z serwera albo z zapisu w telefonie) mają pierwszeństwo nad stanem zapytania.
  // EN: The data (from the server or from the saved copy) takes priority over the query state.
  if (query.data) {
    // PL: Filtr po etapie liczy się w telefonie, więc działa też bez internetu.
    // EN: The stage filter is computed on the phone, so it works offline too.
    const visible = filterByStage(query.data, filter);
    if (visible.length === 0) return <EmptyState isFiltered={filter !== ALL_STAGES} />;
    // PL: Kafle zgłoszeń od najnowszego.
    // EN: The report tiles, newest first.
    return (
      <ul className="ra-list" aria-label="Zgłoszenia">
        {visible.map((report) => (
          <ReportTile key={report.id} report={report} />
        ))}
      </ul>
    );
  }
  // PL: Bez danych i z błędem pokaż komunikat (także przy odmowie 403).
  // EN: Without data and with an error, show the message (also for a 403 refusal).
  if (query.isError) return <Notice text="Nie udało się pobrać zgłoszeń. Spróbuj ponownie za chwilę." />;
  // PL: Bez danych i bez błędu zapytanie jeszcze trwa.
  // EN: Without data and without an error the query is still running.
  return <div role="status" aria-busy="true" />;
}

/**
 * PL: Rysuje ekran listy zgłoszeń w panelu.
 * EN: Draws the report list screen of the panel.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ReportsList() {
  // PL: Wybrany filtr to stan ekranu; lista z serwera albo z zapisu w telefonie.
  // EN: The chosen filter is the screen state; the list comes from the server or from the saved copy.
  const [filter, setFilter] = useState(ALL_STAGES);
  const query = useAdminReports();
  // PL: Pasek z tytułem, chipy filtra i treść pod nimi.
  // EN: The top bar with the title, the filter chips and the body under them.
  return (
    <>
      <PanelTop title="Zgłoszenia" to="/admin" backLabel="Wróć" />
      <div className="ra-chips" role="group" aria-label="Etap">
        {FILTERS.map((item) => (
          <button key={item.code} type="button" className="ra-chip" aria-pressed={item.code === filter} onClick={() => setFilter(item.code)}>{item.label}</button>
        ))}
      </div>
      <ListBody query={query} filter={filter} />
    </>
  );
}
