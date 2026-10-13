/**
 * PL: Ekrany 6.4b i 6.4c: szczegół zgłoszenia, autor albo napis o anonimowości, pasek wyboru etapu, historia i „Zapisz etap”. Przycisk jest nieaktywny, dopóki etap się nie zmienił, i bez internetu. Błąd zapisu zostawia przycisk aktywny.
 * EN: Screens 6.4b and 6.4c: the report detail, the author or the anonymity label, the stage segmented control, the history and "Zapisz etap". The button is disabled until the stage changes, and offline. A save error leaves the button active.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/queries.ts::useAdminReport
 * @uses src/features/reports/admin/queries.ts::useChangeStage
 * @uses src/features/reports/admin/queries.ts::useIsOnline
 * @used_by src/features/reports/admin/ReportsAdminScreen.tsx::ReportDetail
 */

import { useState } from 'react';
import { useParams } from 'react-router';
import { Icon } from './icons';
import { Notice } from './Notice';
import { PanelTop } from './PanelTop';
import { StagePicker } from './StagePicker';
import type { AdminReport, AdminStudent, StageChange } from './api';
import { useAdminReport, useChangeStage, useIsOnline } from './queries';
import { categoryLabel, formatShortDate, placeText, stageLabel } from './reportView';

/**
 * PL: Rysuje kafel autora (ekran 6.4c). Zgłoszenie anonimowe pokazuje napis o anonimowości i nie ma danych autora. Zgłoszenie z autorem pokazuje imię i klasę, gdy serwer je poda; bez nich zostaje sam napis „Autor zgłosił bez anonimowości.”.
 * EN: Draws the author tile (screen 6.4c). An anonymous report shows the anonymity label and has no author data. A report with an author shows the name and class when the server gives them; without them only the label "Autor zgłosił bez anonimowości." stays.
 *
 * @param props - PL: czy zgłoszenie jest anonimowe i imię z klasą autora (albo `null`). EN: whether the report is anonymous, and the author's name and class (or `null`).
 * @returns PL: drzewo elementów kafla. EN: the tree of tile elements.
 */
function AuthorTile({ isAnonymous, student }: { isAnonymous: boolean; student: AdminStudent | null }) {
  // PL: Anonimowe: tylko napis. Z autorem: „Imię · Klasa” (tylko części, które są), pod spodem napis o zgłoszeniu bez anonimowości.
  // EN: Anonymous: only the label. With an author: "Name · Class" (only the parts that exist), with the label about the signed report under it.
  if (isAnonymous) {
    return (
      <div className="ra-author">
        <Icon name="user-round" />
        <div>
          <p>Zgłoszenie anonimowe</p>
          <p className="ra-small">Samorząd nie widzi, kto je wysłał.</p>
        </div>
      </div>
    );
  }
  const who = [student?.name.trim() ?? '', student?.className.trim() ?? ''].filter(Boolean).join(' · ');
  return (
    <div className="ra-author">
      <Icon name="user-round" />
      <div>
        {who ? <p>{who}</p> : null}
        <p className="ra-small">Autor zgłosił bez anonimowości.</p>
      </div>
    </div>
  );
}

/**
 * PL: Rysuje historię etapów: etap i data, od najnowszego.
 * EN: Draws the stage history: the stage and the date, newest first.
 *
 * @param props - PL: wiersze historii. EN: the history rows.
 * @returns PL: drzewo elementów historii. EN: the tree of history elements.
 */
function History({ rows }: { rows: StageChange[] }) {
  // PL: Jeden wiersz na etap, od najnowszego (tak je daje serwer).
  // EN: One row per stage, newest first (as the server gives them).
  return (
    <ul className="ra-history" aria-label="Historia">
      {rows.map((row) => (
        <li key={`${row.stage}-${row.changedAt}`}>
          <span>{stageLabel(row.stage)}</span>
          <span className="ra-small">{formatShortDate(row.changedAt)}</span>
        </li>
      ))}
    </ul>
  );
}

/**
 * PL: Rysuje nagłówek zgłoszenia: znacznik kategorii, datę z miejscem i opis.
 * EN: Draws the report header: the category tag, the date with the place and the description.
 *
 * @param props - PL: zgłoszenie. EN: the report.
 * @returns PL: drzewo elementów nagłówka. EN: the tree of header elements.
 */
function ReportHead({ report }: { report: AdminReport }) {
  // PL: Znacznik kategorii, data z miejscem i opis zgłoszenia.
  // EN: The category tag, the date with the place and the report description.
  return (
    <>
      <div className="ra-tile-head">
        <span className="ra-tag">{categoryLabel(report.category)}</span>
        <span className="ra-small">{formatShortDate(report.createdAt)} · {placeText(report)}</span>
      </div>
      <h2 className="ra-title">{report.description}</h2>
    </>
  );
}

/**
 * PL: Rysuje szczegół załadowanego zgłoszenia i zapis etapu.
 * EN: Draws the detail of a loaded report and the stage saving.
 *
 * @param props - PL: zgłoszenie z historią i autor. EN: the report with its history and the author.
 * @returns PL: drzewo elementów. EN: the tree of elements.
 */
function DetailBody({ report, history, student }: { report: AdminReport; history: StageChange[]; student: AdminStudent | null }) {
  // PL: Wybrany etap to stan ekranu; `null` znaczy, że Samorząd jeszcze nic nie wybrał.
  // EN: The chosen stage is the screen state; `null` means the Student Council has not chosen anything yet.
  const [picked, setPicked] = useState<string | null>(null);
  const save = useChangeStage(report.id);
  const isOnline = useIsOnline();
  // PL: Zapis jest możliwy tylko przy zmienionym etapie, z internetem i gdy poprzedni zapis nie trwa.
  // EN: Saving is possible only with a changed stage, with internet and when the previous save is not running.
  const stage = picked ?? report.stage;
  const canSave = stage !== report.stage && isOnline && !save.isPending;
  // PL: Nagłówek, autor, pasek wyboru, historia i dolny przycisk z uwagami nad nim.
  // EN: The header, the author, the segmented control, the history and the bottom button with the notes above it.
  return (
    <>
      <ReportHead report={report} />
      <AuthorTile isAnonymous={report.isAnonymous} student={student} />
      <h3 className="ra-label">Etap</h3>
      <StagePicker value={stage} onChange={setPicked} />
      <h3 className="ra-label">Historia</h3>
      <History rows={history} />
      <div className="ra-cta">
        {isOnline ? null : <p className="ra-small">Zmiana etapu wymaga internetu.</p>}
        {save.isError ? <Notice text="Nie udało się zapisać etapu. Spróbuj ponownie za chwilę." /> : null}
        <button type="button" className="ra-btn" disabled={!canSave} onClick={() => save.mutate(stage, { onSuccess: () => setPicked(null) })}>
          <Icon name="check" />Zapisz etap
        </button>
      </div>
    </>
  );
}

/**
 * PL: Rysuje ekran szczegółu zgłoszenia o numerze z adresu.
 * EN: Draws the detail screen of the report whose id is in the address.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function ReportDetail() {
  // PL: Numer zgłoszenia jest w adresie; szczegół z serwera albo z zapisu w telefonie.
  // EN: The report id is in the address; the detail comes from the server or from the saved copy.
  const { id = '' } = useParams();
  const query = useAdminReport(id);
  // PL: Dane mają pierwszeństwo, potem błąd, a bez obu zapytanie jeszcze trwa.
  // EN: The data takes priority, then the error, and with neither the query is still running.
  return (
    <>
      <PanelTop title="Zgłoszenie" to="/reports/admin" backLabel="Wróć" />
      {query.data ? <DetailBody key={query.data.report.id} report={query.data.report} history={query.data.history} student={query.data.student} /> : null}
      {!query.data && query.isError ? <Notice text="Nie udało się pobrać zgłoszeń. Spróbuj ponownie za chwilę." /> : null}
      {!query.data && !query.isError ? <div role="status" aria-busy="true" /> : null}
    </>
  );
}
