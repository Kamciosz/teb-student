/**
 * PL: Krok 3 kreatora (ekran 5.3): podgląd wpisu w tym samym wyglądzie, który zobaczy uczeń. Kafel to EntryCard z listy (podtor 3a), treść to RichContent z widoku szczegółów. Pod podglądem jest grupa z przełącznikiem „Opublikuj o wybranej godzinie” (dzień i godzina w Warszawie), przyciski „Zapisz szkic i dokończ później” i „Wyślij do korekty” zwykłym tekstem, przyklejony na dole „Opublikuj” i komunikat o błędzie.
 * EN: Wizard step 3 (screen 5.3): the entry preview in the same look the student will see. The tile is EntryCard from the list (subtrack 3a), the content is RichContent from the details view. Under the preview is the group with the "Opublikuj o wybranej godzinie" switch (the day and the time in Warsaw), the "Zapisz szkic i dokończ później" and "Wyślij do korekty" buttons as plain text, the "Opublikuj" button stuck to the bottom, and the error message.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::ListGroup
 * @uses src/shared/index.ts::TextField
 * @uses src/features/news/feed/index.ts::EntryCard
 * @uses src/features/news/feed/index.ts::RichContent
 * @uses src/features/news/editor/previewEntry.ts::previewEntry
 * @uses src/features/news/editor/warsawTime.ts::warsawToEpochMs
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::PreviewStep
 */

import type { JSONContent } from '@tiptap/core';
import { useState } from 'react';
import { Button, ListGroup, TextField } from '../../../shared';
import { EntryCard, RichContent } from '../feed';
import { previewEntry } from './previewEntry';
import { SCREEN, TEXTS } from './texts';
import type { EntryType } from './TypeStep';
import { warsawToEpochMs } from './warsawTime';

/**
 * PL: Dane kroku.
 * EN: Step data.
 */
export type PreviewStepProps = {
  /** PL: Typ wpisu. EN: The entry type. */
  type: EntryType;
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Treść. EN: The content. */
  body: JSONContent;
  /** PL: Czy trwa wysyłka (przyciski wyłączone). EN: Whether sending is in progress (the buttons are off). */
  isSaving: boolean;
  /** PL: Komunikat o błędzie wysyłki albo null. EN: The sending error message or null. */
  message: string | null;
  /** PL: Zapis jako szkic, wysyłka do korekty albo publikacja, z chwilą zaplanowanej publikacji (albo null, gdy od razu; tylko publikacja może mieć godzinę). EN: Saving as a draft, sending to review, or publishing, with the scheduled publication moment (or null, when immediate; only a publication can have a time). */
  onSave: (status: 'draft' | 'in_review' | 'published', publishAt: number | null) => void;
};

/**
 * PL: Rysuje krok 3.
 * EN: Draws step 3.
 *
 * @param props - PL: wpis i funkcja zapisu. EN: the entry and the save function.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function PreviewStep({ type, title, body, isSaving, message, onSave }: PreviewStepProps) {
  // PL: Chwila liczona raz, przy wejściu w krok 3, żeby kafel nie zmieniał się przy każdym renderze. EN: The moment is counted once, when entering step 3, so the tile does not change on every render.
  const [publishedAt] = useState(() => new Date().toISOString());
  // PL: Zaplanowanie: pole włączone albo nie, dzień i godzina wpisane przez redaktora. EN: Scheduling: the field on or off, the day and the time typed by the editor.
  const [scheduled, setScheduled] = useState(false);
  const [day, setDay] = useState('');
  const [time, setTime] = useState('');
  // PL: Błąd terminu pokazujemy przed wysyłką, bo wtedy nic nie trafia na serwer. EN: The schedule error is shown before sending, because then nothing reaches the server.
  const [scheduleError, setScheduleError] = useState<string | null>(null);

  // PL: Publikacja bierze godzinę z pól, gdy zaznaczono zaplanowanie. Szkic i wysyłka do korekty zawsze zapisują się bez godziny.
  // EN: A publication takes the time from the fields when scheduling is ticked. A draft and sending to review are always saved without a time.
  function submit(status: 'draft' | 'in_review' | 'published') {
    if (status !== 'published' || !scheduled) {
      setScheduleError(null);
      onSave(status, null);
      return;
    }
    const publishAt = warsawToEpochMs(day, time);
    if (publishAt === null) {
      setScheduleError(TEXTS.scheduleMissing);
      return;
    }
    setScheduleError(null);
    onSave(status, publishAt);
  }

  const shownError = scheduleError ?? message;
  return (
    <section className="editor-step" aria-labelledby="editor-step-heading">
      <h2 id="editor-step-heading">{SCREEN.previewHeading}</h2>
      {/* PL: Kafel z listy. Podgląd nie ma adresu na serwerze, więc kliknięcie kafla nic nie otwiera: przechwytujemy je na wrapperze, zanim dojdzie do linku (react-router nie nawiguje po preventDefault). Fokus klawiatury zostaje na kaflu. EN: The list tile. The preview has no address on the server, so clicking the tile opens nothing: we catch the click on the wrapper before it reaches the link (react-router does not navigate after preventDefault). Keyboard focus stays on the tile. */}
      <div onClickCapture={(event) => event.preventDefault()}>
        <EntryCard entry={previewEntry(type, title, body, publishedAt)} />
      </div>
      {/* PL: Treść jak w szczegółach wpisu. Linki i film działają jak u ucznia. EN: The content as in the entry details. Links and the video work as for the student. */}
      <RichContent body={body} />
      {/* PL: Zaplanowanie w grupie: przełącznik jako wiersz listy, pod nim dzień i godzina, gdy włączony. EN: Scheduling in a group: the switch as a list row, with the day and the time under it when it is on. */}
      <ListGroup>
        <label className="editor-switch">
          <input type="checkbox" checked={scheduled} onChange={(event) => setScheduled(event.target.checked)} />
          {TEXTS.scheduleToggle}
        </label>
        {scheduled ? (
          <>
            <TextField className="editor-field" label={TEXTS.scheduleDate} type="date" value={day} onChange={(event) => setDay(event.target.value)} />
            <TextField className="editor-field" label={TEXTS.scheduleTime} type="time" value={time} onChange={(event) => setTime(event.target.value)} />
          </>
        ) : null}
      </ListGroup>
      {/* PL: Zapis szkicu i wysyłka do korekty zwykłym tekstem, bo główna akcja to publikacja. EN: Saving the draft and sending to review as plain text, because the main action is the publication. */}
      <div className="editor-stack">
        <Button type="button" variant="plain" disabled={isSaving} onClick={() => submit('draft')}>{SCREEN.saveDraft}</Button>
        <Button type="button" variant="plain" disabled={isSaving} onClick={() => submit('in_review')}>{TEXTS.sendToReview}</Button>
      </div>
      {/* PL: Błąd zapisu albo terminu. Czytnik ekranu odczytuje go od razu. EN: The save or schedule error. A screen reader reads it at once. */}
      {shownError ? <p role="alert" className="editor-error">{shownError}</p> : null}
      {/* PL: Przycisk „Opublikuj” przyklejony do dołu ekranu, nad paskiem domowym. Jedyny wypełniony przycisk kroku. EN: The "Opublikuj" button stuck to the bottom of the screen, above the home bar. The only filled button of the step. */}
      <div className="editor-sticky">
        <Button type="button" className="editor-wide" disabled={isSaving} onClick={() => submit('published')}>{isSaving ? TEXTS.saving : SCREEN.publish}</Button>
      </div>
    </section>
  );
}
