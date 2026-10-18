/**
 * PL: Widok wpisu w korekcie (podtor 3b): pasek ScreenHeader z „Wpisy” do listy wpisów, podgląd wpisu i przycisk „Zatwierdź i opublikuj” dla redaktora, który nie jest autorem wpisu. Autor i redaktor-autor widzą tylko komunikat, że wpis czeka na korektę. Zatwierdzenie idzie do serwera, który sam sprawdza, że to nie autor.
 * EN: The view of an entry in review (subtrack 3b): a ScreenHeader with "Wpisy" back to the entries list, a preview of the entry, and the "Zatwierdź i opublikuj" button for an editor who is not the author. The author, and the author-editor, only see a message that the entry waits for review. Approval goes to the server, which checks by itself that the editor is not the author.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/shared/index.ts::Button
 * @uses src/shared/index.ts::ScreenHeader
 * @uses src/features/news/editor/api.ts::approveEntry
 * @uses src/features/news/editor/api.ts::DraftToEdit
 * @uses src/features/news/editor/previewEntry.ts::previewEntry
 * @uses src/features/news/feed/index.ts::EntryCard
 * @uses src/features/news/feed/index.ts::RichContent
 * @used_by src/features/news/editor/NewsEditorScreen.tsx::DraftLoader
 */

import type { JSONContent } from '@tiptap/core';
import { useState } from 'react';
import { Link } from 'react-router';
import { Button, ScreenHeader } from '../../../shared';
import { EntryCard, RichContent } from '../feed';
import { approveEntry, type DraftToEdit } from './api';
import { previewEntry } from './previewEntry';
import { SCREEN, TEXTS } from './texts';
import type { EntryType } from './TypeStep';

/**
 * PL: Dane kroku: wpis w korekcie wczytany z serwera.
 * EN: Step data: the entry in review loaded from the server.
 */
export type ReviewStepProps = {
  /** PL: Szkic w korekcie, z numerem i flagą uprawnienia do zatwierdzenia. EN: The entry in review, with its id and the approval permission flag. */
  draft: DraftToEdit;
};

/**
 * PL: Rysuje wpis w korekcie: podgląd, a dla redaktora innego niż autor przycisk zatwierdzenia. Po zatwierdzeniu pokazuje potwierdzenie z przejściem do panelu.
 * EN: Draws the entry in review: the preview, and for an editor other than the author the approval button. After approval it shows the confirmation with a link to the panel.
 *
 * @param props - PL: wpis w korekcie. EN: the entry in review.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function ReviewStep({ draft }: ReviewStepProps) {
  // PL: Chwila liczona raz, przy wczytaniu, żeby kafel nie zmieniał się przy każdym renderze. EN: The moment is counted once, at loading, so the tile does not change on every render.
  const [publishedAt] = useState(() => new Date().toISOString());
  // PL: Stan zatwierdzenia: trwa, komunikat o błędzie i wynik po sukcesie.
  // EN: The approval state: in progress, the error message and the result after success.
  const [isApproving, setIsApproving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [isApproved, setIsApproved] = useState(false);

  // PL: Zatwierdza wpis. Błąd zostawia wpis w korekcie i pokazuje komunikat, sukces pokazuje potwierdzenie.
  // EN: Approves the entry. An error leaves the entry in review and shows a message, success shows the confirmation.
  async function approve(): Promise<void> {
    if (isApproving) return;
    setIsApproving(true);
    setMessage(null);
    const result = await approveEntry(draft.id);
    setIsApproving(false);
    if (result.ok) setIsApproved(true);
    else setMessage(result.message);
  }

  if (isApproved) {
    return (
      <main className="editor-screen" data-subtrack="3b">
        <ScreenHeader title={SCREEN.title} backTo="/news/admin" backLabel={TEXTS.back} />
        <p role="status" className="editor-done">{TEXTS.savedPublished}</p>
        <Link className="ui-button ui-button--filled editor-wide" to="/news/admin">{TEXTS.goToPanel}</Link>
      </main>
    );
  }

  const type = draft.type as EntryType;
  const body = draft.body as JSONContent;
  return (
    <main className="editor-screen" data-subtrack="3b">
      <ScreenHeader title={SCREEN.title} backTo="/news/admin" backLabel={TEXTS.back} />
      <section className="editor-step" aria-labelledby="editor-step-heading">
        <h2 id="editor-step-heading">{TEXTS.reviewHeading}</h2>
        {/* PL: Kafel z listy. Podgląd nie ma adresu na serwerze, więc kliknięcie kafla nic nie otwiera. EN: The list tile. The preview has no address on the server, so clicking the tile opens nothing. */}
        <div onClickCapture={(event) => event.preventDefault()}>
          <EntryCard entry={previewEntry(type, draft.title, body, publishedAt)} />
        </div>
        <RichContent body={body} />
        {/* PL: Błąd zatwierdzenia. Czytnik ekranu odczytuje go od razu. EN: The approval error. A screen reader reads it at once. */}
        {message ? <p role="alert" className="editor-error">{message}</p> : null}
        {draft.canApprove ? (
          /* PL: Zatwierdzenie przyklejone do dołu, jedyny wypełniony przycisk ekranu. EN: The approval stuck to the bottom, the only filled button of the screen. */
          <div className="editor-sticky">
            <Button type="button" className="editor-wide" disabled={isApproving} onClick={() => void approve()}>
              {isApproving ? TEXTS.approving : TEXTS.approve}
            </Button>
          </div>
        ) : (
          <p>{TEXTS.reviewWaiting}</p>
        )}
      </section>
    </main>
  );
}
