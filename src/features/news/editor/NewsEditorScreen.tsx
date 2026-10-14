/**
 * PL: Ekran „Nowy wpis” i edycja szkicu (podtor 3b): kreator w trzech krokach (typ, treść w edytorze, podgląd) z ekranów 5.1, 5.2 i 5.3 z docs/projekt/EKRANY.md. Adres /news/editor otwiera nowy wpis, a /news/editor/:id otwiera szkic do edycji: najpierw wczytuje go z serwera, potem pokazuje kreator z jego danymi. Kreator trzyma wpis w pamięci ekranu, więc po powrocie do wcześniejszego kroku nic nie ginie, a po błędzie wysyłki (na przykład bez internetu) wpis zostaje w edytorze. Zapis idzie do serwera, który sprawdza treść schematem.
 * EN: The "Nowy wpis" (new entry) screen and editing a draft (subtrack 3b): a three-step wizard (type, content in the editor, preview) from screens 5.1, 5.2 and 5.3 in docs/projekt/EKRANY.md. The address /news/editor opens a new entry, and /news/editor/:id opens a draft for editing: it first loads the draft from the server, then shows the wizard with its data. The wizard keeps the entry in the screen's memory, so going back to an earlier step loses nothing, and after a sending error (for example without internet) the entry stays in the editor. Saving goes to the server, which checks the content against the schema.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/api.ts::sendEntry
 * @uses src/features/news/editor/api.ts::loadDraft
 * @uses src/features/news/editor/api.ts::updateEntry
 * @uses src/features/news/editor/TypeStep.tsx::TypeStep
 * @uses src/features/news/editor/ContentStep.tsx::ContentStep
 * @uses src/features/news/editor/PreviewStep.tsx::PreviewStep
 * @uses src/features/news/editor/ReviewStep.tsx::ReviewStep
 * @used_by src/features/news/editor/index.ts::NewsEditorScreen
 */

import type { JSONContent } from '@tiptap/core';
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router';
import { loadDraft, sendEntry, updateEntry, type DraftToEdit } from './api';
import { ContentStep } from './ContentStep';
import './editor.css';
import { PreviewStep } from './PreviewStep';
import { ReviewStep } from './ReviewStep';
import { TEXTS } from './texts';
import { TypeStep, type EntryType } from './TypeStep';
import { WizardTop } from './WizardTop';
import { formatWarsawMoment } from './warsawTime';

/**
 * PL: Dane, od których kreator startuje, gdy edytujemy szkic.
 * EN: The data the wizard starts from when a draft is edited.
 */
type StartData = {
  /** PL: Typ wpisu. EN: The entry type. */
  type: EntryType;
  /** PL: Tytuł. EN: The title. */
  title: string;
  /** PL: Treść jako dokument edytora. EN: The content as an editor document. */
  body: JSONContent;
};

/**
 * PL: Liczy znaki tekstu w dokumencie tak samo jak edytor (suma tekstów w węzłach, bez znaków między akapitami).
 * EN: Counts the text characters in a document the same way as the editor (the sum of the texts in the nodes, without characters between paragraphs).
 *
 * @param node - PL: węzeł dokumentu. EN: a document node.
 * @returns PL: liczba znaków tekstu. EN: the number of text characters.
 */
function countText(node: JSONContent): number {
  return (node.text?.length ?? 0) + (node.content ?? []).reduce((sum, child) => sum + countText(child), 0);
}

/**
 * PL: Rysuje ekran „Nowy wpis” albo edycję szkicu, zależnie od adresu.
 * EN: Draws the "Nowy wpis" screen or the draft editing, depending on the address.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function NewsEditorScreen() {
  // PL: Część adresu po /news/editor: pusta dla nowego wpisu, numer szkicu przy edycji.
  // EN: The part of the address after /news/editor: empty for a new entry, the draft id when editing.
  const draftId = useParams()['*'] ?? '';
  if (draftId === '') return <EntryWizard />;
  // PL: Klucz z numerem szkicu: zmiana adresu montuje wczytywanie od nowa.
  // EN: The key with the draft id: a change of address mounts the loading again.
  return <DraftLoader key={draftId} draftId={draftId} />;
}

/**
 * PL: Wczytuje szkic z serwera i dopiero potem pokazuje kreator. Błąd (opublikowany wpis, brak wpisu, brak internetu) pokazuje komunikat i link do panelu.
 * EN: Loads the draft from the server and only then shows the wizard. An error (a published entry, no entry, no internet) shows a message and a link to the panel.
 *
 * @param props - PL: numer szkicu. EN: the draft id.
 * @returns PL: ekran wczytywania, komunikat albo kreator z danymi szkicu. EN: the loading screen, a message, or the wizard with the draft data.
 */
function DraftLoader({ draftId }: { draftId: string }) {
  // PL: Stan wczytywania: trwa, szkic gotowy albo komunikat błędu.
  // EN: The loading state: in progress, the draft ready, or an error message.
  const [state, setState] = useState<{ status: 'loading' } | { status: 'ready'; draft: DraftToEdit } | { status: 'failed'; message: string }>({ status: 'loading' });

  useEffect(() => {
    // PL: Odpowiedź po zmianie adresu albo wyjściu z ekranu nie może nadpisać stanu.
    // EN: A response that arrives after the address changed or after leaving the screen must not overwrite the state.
    let active = true;
    void loadDraft(draftId).then((result) => {
      if (!active) return;
      setState(result.ok ? { status: 'ready', draft: result.draft } : { status: 'failed', message: result.message });
    });
    return () => {
      active = false;
    };
  }, [draftId]);

  if (state.status === 'loading') {
    return (
      <main className="editor-screen" data-subtrack="3b">
        <p role="status">{TEXTS.draftLoading}</p>
      </main>
    );
  }

  if (state.status === 'failed') {
    return (
      <main className="editor-screen" data-subtrack="3b">
        <p role="alert" className="editor-error">{state.message}</p>
        <Link className="editor-button editor-button--wide" to="/news/admin">{TEXTS.goToPanel}</Link>
      </main>
    );
  }

  const { draft } = state;
  // PL: Wpis w korekcie nie jest już szkicem do edycji: pokazujemy go do podglądu i zatwierdzenia.
  // EN: An entry in review is no longer a draft to edit: we show it for preview and approval.
  if (draft.status === 'in_review') return <ReviewStep draft={draft} />;
  return <EntryWizard draftId={draftId} start={{ type: draft.type as EntryType, title: draft.title, body: draft.body as JSONContent }} />;
}

/**
 * PL: Kreator wpisu. Bez numeru szkicu tworzy nowy wpis, z numerem zapisuje zmiany w tym samym szkicu.
 * EN: The entry wizard. Without a draft id it creates a new entry, with one it saves the changes to the same draft.
 *
 * @param props - PL: numer szkicu (przy edycji) i dane startowe (przy edycji). EN: the draft id (when editing) and the starting data (when editing).
 * @returns PL: kreator albo potwierdzenie zapisu. EN: the wizard or the save confirmation.
 */
function EntryWizard({ draftId, start }: { draftId?: string; start?: StartData }) {
  // PL: Wpis w trakcie pisania: krok, typ (domyślnie News, bo „Ważne” trafia na pulpit), tytuł i treść z liczbą znaków. Przy edycji startuje z danymi szkicu.
  // EN: The entry being written: the step, the type (News by default, because "Ważne" goes to the dashboard), the title and the content with the character count. When editing it starts from the draft data.
  const [step, setStep] = useState(1);
  const [type, setType] = useState<EntryType>(start?.type ?? 'news');
  const [title, setTitle] = useState(start?.title ?? '');
  const [body, setBody] = useState<JSONContent | null>(start?.body ?? null);
  const [textLength, setTextLength] = useState(start ? countText(start.body) : 0);
  // PL: Stan wysyłki: trwa, komunikat o błędzie i wynik po sukcesie.
  // EN: The sending state: in progress, the error message and the result after success.
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  // PL: Zapisany wpis: stan i zaplanowana chwila publikacji (albo null, gdy od razu). Pokazuje potwierdzenie.
  // EN: The saved entry: the status and the scheduled publication moment (or null, when immediate). It drives the confirmation.
  const [saved, setSaved] = useState<{ status: 'draft' | 'in_review' | 'published'; publishAt: number | null } | null>(null);

  // PL: Wysyła wpis: nowy albo zmiany w szkicu. Błąd zostawia wpis w edytorze i pokazuje komunikat, sukces pokazuje potwierdzenie.
  // EN: Sends the entry: a new one or changes to the draft. An error leaves the entry in the editor and shows a message, success shows the confirmation.
  async function save(status: 'draft' | 'in_review' | 'published', publishAt: number | null): Promise<void> {
    if (body === null || isSaving) return;
    setIsSaving(true);
    setMessage(null);
    const entry = { type, title: title.trim(), status, body, publishAt };
    const result = draftId ? await updateEntry(draftId, entry) : await sendEntry(entry);
    setIsSaving(false);
    if (result.ok) setSaved({ status, publishAt });
    else setMessage(result.message);
  }

  // PL: Po zapisie pokazujemy potwierdzenie z przejściem do panelu. Zaplanowana publikacja mówi, kiedy wpis się pojawi.
  // EN: After saving we show the confirmation with a link to the panel. A scheduled publication says when the entry will appear.
  if (saved) {
    const confirmation = saved.status === 'draft'
      ? TEXTS.savedDraft
      : saved.status === 'in_review'
        ? TEXTS.sentToReview
        : saved.publishAt === null ? TEXTS.savedPublished : TEXTS.scheduledFor(formatWarsawMoment(saved.publishAt));
    return (
      <main className="editor-screen" data-subtrack="3b">
        <p role="status" className="editor-done">{confirmation}</p>
        <Link className="editor-button editor-button--wide" to="/news/admin">{TEXTS.goToPanel}</Link>
      </main>
    );
  }

  return (
    <main className="editor-screen" data-subtrack="3b">
      <WizardTop step={step} onBack={() => setStep(step - 1)} />
      {step === 1 ? <TypeStep type={type} onType={setType} onNext={() => setStep(2)} /> : null}
      {step === 2 ? (
        <ContentStep
          title={title}
          body={body}
          textLength={textLength}
          onTitle={setTitle}
          onBody={(next, length) => { setBody(next); setTextLength(length); }}
          onNext={() => setStep(3)}
        />
      ) : null}
      {step === 3 && body ? <PreviewStep type={type} title={title.trim()} body={body} isSaving={isSaving} message={message} onSave={(status, publishAt) => void save(status, publishAt)} /> : null}
    </main>
  );
}
