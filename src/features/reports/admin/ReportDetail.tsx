/**
 * PL: Ekrany 6.4b i 6.4c: szczegół zgłoszenia, autor albo napis o anonimowości, pasek wyboru etapu, opcjonalna odpowiedź dla autora (do 500 znaków, z licznikiem), historia i „Zapisz etap”. Przycisk jest nieaktywny, dopóki etap się nie zmienił, i bez internetu. Błąd zapisu zostawia przycisk aktywny i wpisaną odpowiedź.
 * EN: Screens 6.4b and 6.4c: the report detail, the author or the anonymity label, the stage segmented control, the optional answer for the author (up to 500 characters, with a counter), the history and "Zapisz etap". The button is disabled until the stage changes, and offline. A save error leaves the button active and the typed answer in place.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/reports/admin/queries.ts::useAdminReport
 * @uses src/features/reports/admin/queries.ts::useChangeStage
 * @uses src/features/reports/admin/queries.ts::useIsOnline
 * @uses src/features/reports/admin/reportLabels.ts::STAGE_NOTE_MAX_LENGTH
 * @uses src/shared/ui/Button.tsx::Button
 * @uses src/shared/ui/ScreenHeader.tsx::ScreenHeader
 * @used_by src/features/reports/admin/ReportsAdminScreen.tsx::ReportDetail
 */

import { useState } from 'react';
import { useParams } from 'react-router';
import { Button } from '../../../shared/ui/Button';
import { ScreenHeader } from '../../../shared/ui/ScreenHeader';
import { Icon } from './icons';
import { Notice } from './Notice';
import { StagePicker } from './StagePicker';
import type { AdminReport, AdminStudent, StageChange } from './api';
import { useAdminReport, useChangeStage, useIsOnline } from './queries';
import { STAGE_NOTE_MAX_LENGTH } from './reportLabels';
import { categoryLabel, formatShortDate, joinText, placeText, stageLabel } from './reportView';

/**
 * PL: Rysuje zdjęcie dołączone do zgłoszenia. Podgląd ładuje się leniwie i nie wychodzi poza szerokość ekranu; kliknięcie otwiera pełny plik w nowej karcie.
 * EN: Draws the photo attached to the report. The preview loads lazily and stays within the screen width; a click opens the full file in a new tab.
 *
 * @param props - PL: numer zdjęcia z modułu mediów. EN: the photo id from the media module.
 * @returns PL: link z podglądem zdjęcia. EN: the link with the photo preview.
 */
function ReportPhoto({ photoId }: { photoId: string }) {
  // PL: Ten sam adres co w module mediów: numer zakodowany w ścieżce, serwer sprawdza sesję.
  // EN: The same address as in the media module: the id encoded in the path, the server checks the session.
  const src = `/api/media/${encodeURIComponent(photoId)}`;
  return (
    <a href={src} target="_blank" rel="noopener noreferrer">
      <img src={src} alt="Zdjęcie dołączone do zgłoszenia" loading="lazy" className="ra-photo" />
    </a>
  );
}

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
 * PL: Rysuje pole „Odpowiedź dla autora” z licznikiem znaków. Pole ma `maxLength`, więc nie przyjmie więcej niż limit; licznik pokazuje, ile znaków jest wpisanych.
 * EN: Draws the "Odpowiedź dla autora" field with a character counter. The field has `maxLength`, so it does not take more than the limit; the counter shows how many characters are typed.
 *
 * @param props - PL: bieżący tekst i funkcja, która go zmienia. EN: the current text and the function that changes it.
 * @returns PL: drzewo elementów pola. EN: the tree of field elements.
 */
function StageNote({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  // PL: Licznik jest opisem pola dla czytnika ekranu (aria-describedby), więc wiąże go z napisem „n/500”.
  // EN: The counter is the field's description for the screen reader (aria-describedby), so it ties the field to the "n/500" text.
  return (
    <>
      <label htmlFor="stage-note" className="ra-label">Odpowiedź dla autora</label>
      <textarea id="stage-note" className="ra-note" value={value} maxLength={STAGE_NOTE_MAX_LENGTH} aria-describedby="stage-note-count" onChange={(event) => onChange(event.target.value)} />
      <p id="stage-note-count" className="ra-small">{value.length}/{STAGE_NOTE_MAX_LENGTH}</p>
    </>
  );
}

/**
 * PL: Rysuje historię etapów: etap i data, od najnowszego. Gdy przy zmianie etapu była odpowiedź dla autora, pokazuje ją pod wpisem, na osobnym wierszu.
 * EN: Draws the stage history: the stage and the date, newest first. When a change had an answer for the author, it shows it under the entry, on its own line.
 *
 * @param props - PL: wiersze historii. EN: the history rows.
 * @returns PL: drzewo elementów historii. EN: the tree of history elements.
 */
function History({ rows }: { rows: StageChange[] }) {
  // PL: Jeden wiersz na etap, od najnowszego (tak je daje serwer). Odpowiedź pokazujemy tylko, gdy jest niepusta; wpis zapisany przed zmianą nie ma tego pola, więc `undefined` też nie pokaże nic.
  // EN: One row per stage, newest first (as the server gives them). We show the answer only when it is non-empty; an entry saved before this change has no such field, so `undefined` shows nothing either.
  return (
    <ul className="ra-history" aria-label="Historia">
      {rows.map((row) => (
        <li key={`${row.stage}-${row.changedAt}`}>
          <span>{stageLabel(row.stage)}</span>
          <span className="ra-small">{formatShortDate(row.changedAt)}</span>
          {row.note ? <p className="ra-history-note"><span className="ra-small">Odpowiedź dla autora:</span> {row.note}</p> : null}
        </li>
      ))}
    </ul>
  );
}

/**
 * PL: Rysuje nagłówek zgłoszenia: znacznik kategorii, datę z miejscem, liczbę osób i opis.
 * EN: Draws the report header: the category tag, the date with the place, the number of people and the description.
 *
 * @param props - PL: zgłoszenie. EN: the report.
 * @returns PL: drzewo elementów nagłówka. EN: the tree of header elements.
 */
function ReportHead({ report }: { report: AdminReport }) {
  // PL: Liczba osób („Mnie też”) albo `null`, gdy nikt nie dołączył lub brak danych.
  // EN: The number of people ("Me too") or `null`, when nobody joined or there is no data.
  const joins = joinText(report.joinCount);
  // PL: Znacznik kategorii, data z miejscem, liczba osób i opis zgłoszenia.
  // EN: The category tag, the date with the place, the number of people and the report description.
  return (
    <>
      <div className="ra-tile-head">
        <span className="ra-tag">{categoryLabel(report.category)}</span>
        <span className="ra-small">{formatShortDate(report.createdAt)} · {placeText(report)}</span>
        {joins ? <span className="ra-small">{joins}</span> : null}
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
  // PL: Odpowiedź dla autora, wpisana przed zapisem; po udanym zapisie znika.
  // EN: The answer for the author, typed before saving; it clears after a successful save.
  const [note, setNote] = useState('');
  const save = useChangeStage(report.id);
  const isOnline = useIsOnline();
  // PL: Zapis jest możliwy tylko przy zmienionym etapie, z internetem i gdy poprzedni zapis nie trwa.
  // EN: Saving is possible only with a changed stage, with internet and when the previous save is not running.
  const stage = picked ?? report.stage;
  const canSave = stage !== report.stage && isOnline && !save.isPending;
  // PL: Nagłówek, zdjęcie (jeśli jest), autor, pasek wyboru, odpowiedź, historia i dolny przycisk z uwagami nad nim.
  // EN: The header, the photo (if there is one), the author, the segmented control, the answer, the history and the bottom button with the notes above it.
  return (
    <>
      <ReportHead report={report} />
      {report.photoId ? <ReportPhoto photoId={report.photoId} /> : null}
      <AuthorTile isAnonymous={report.isAnonymous} student={student} />
      <h3 className="ra-label">Etap</h3>
      <StagePicker value={stage} onChange={setPicked} />
      <StageNote value={note} onChange={setNote} />
      <h3 className="ra-label">Historia</h3>
      <History rows={history} />
      <div className="ra-cta">
        {isOnline ? null : <p className="ra-small">Zmiana etapu wymaga internetu.</p>}
        {save.isError ? <Notice text="Nie udało się zapisać etapu. Spróbuj ponownie za chwilę." /> : null}
        {/* PL: Pusta albo same spacje to brak odpowiedzi (`null`). EN: Empty or only spaces means no answer (`null`). */}
        <Button variant="filled" className="ra-save" disabled={!canSave} onClick={() => save.mutate({ stage, note: note.trim() || null }, { onSuccess: () => { setPicked(null); setNote(''); } })}>
          <Icon name="check" />Zapisz etap
        </Button>
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
      <ScreenHeader title="Zgłoszenie" backTo="/reports/admin" />
      {query.data ? <DetailBody key={query.data.report.id} report={query.data.report} history={query.data.history} student={query.data.student} /> : null}
      {!query.data && query.isError ? <Notice text="Nie udało się pobrać zgłoszeń. Spróbuj ponownie za chwilę." /> : null}
      {!query.data && !query.isError ? <div role="status" aria-busy="true" /> : null}
    </>
  );
}
