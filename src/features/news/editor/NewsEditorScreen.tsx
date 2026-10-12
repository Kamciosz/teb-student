/**
 * PL: Ekran „Nowy wpis” (podtor 3b): kreator w trzech krokach (typ, treść w edytorze, podgląd) z ekranów 5.1, 5.2 i 5.3 z docs/projekt/EKRANY.md. Trzyma wpis w pamięci ekranu, więc po powrocie do wcześniejszego kroku nic nie ginie, a po błędzie wysyłki (na przykład bez internetu) wpis zostaje w edytorze. Zapis jako szkic albo publikacja idzie do serwera, który sprawdza treść schematem.
 * EN: The "Nowy wpis" (new entry) screen (subtrack 3b): a three-step wizard (type, content in the editor, preview) from screens 5.1, 5.2 and 5.3 in docs/projekt/EKRANY.md. It keeps the entry in the screen's memory, so going back to an earlier step loses nothing, and after a sending error (for example without internet) the entry stays in the editor. Saving as a draft or publishing goes to the server, which checks the content against the schema.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/api.ts::sendEntry
 * @uses src/features/news/editor/TypeStep.tsx::TypeStep
 * @uses src/features/news/editor/ContentStep.tsx::ContentStep
 * @uses src/features/news/editor/PreviewStep.tsx::PreviewStep
 * @used_by src/features/news/editor/index.ts::NewsEditorScreen
 */

import type { JSONContent } from '@tiptap/core';
import { useState } from 'react';
import { Link } from 'react-router';
import { sendEntry } from './api';
import { ContentStep } from './ContentStep';
import './editor.css';
import { PreviewStep } from './PreviewStep';
import { TO_AGREE } from './texts';
import { TypeStep, type EntryType } from './TypeStep';
import { WizardTop } from './WizardTop';

/**
 * PL: Rysuje ekran „Nowy wpis”.
 * EN: Draws the "Nowy wpis" screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function NewsEditorScreen() {
  // PL: Wpis w trakcie pisania: krok, typ (domyślnie News, bo „Ważne” trafia na pulpit), tytuł i treść z liczbą znaków.
  // EN: The entry being written: the step, the type (News by default, because "Ważne" goes to the dashboard), the title and the content with the character count.
  const [step, setStep] = useState(1);
  const [type, setType] = useState<EntryType>('news');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState<JSONContent | null>(null);
  const [textLength, setTextLength] = useState(0);
  // PL: Stan wysyłki: trwa, komunikat o błędzie i wynik po sukcesie.
  // EN: The sending state: in progress, the error message and the result after success.
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState<'draft' | 'published' | null>(null);

  // PL: Wysyła wpis. Błąd zostawia wpis w edytorze i pokazuje komunikat, sukces pokazuje potwierdzenie.
  // EN: Sends the entry. An error leaves the entry in the editor and shows a message, success shows the confirmation.
  async function save(status: 'draft' | 'published'): Promise<void> {
    if (body === null || isSaving) return;
    setIsSaving(true);
    setMessage(null);
    const result = await sendEntry({ type, title: title.trim(), status, body });
    setIsSaving(false);
    if (result.ok) setSavedStatus(status);
    else setMessage(result.message);
  }

  // PL: Po zapisie pokazujemy potwierdzenie z przejściem do panelu.
  // EN: After saving we show the confirmation with a link to the panel.
  if (savedStatus) {
    return (
      <main className="editor-screen" data-subtrack="3b">
        <p role="status" className="editor-done">{savedStatus === 'draft' ? TO_AGREE.savedDraft : TO_AGREE.savedPublished}</p>
        <Link className="editor-button editor-button--wide" to="/news/admin">{TO_AGREE.goToPanel}</Link>
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
      {step === 3 && body ? <PreviewStep type={type} title={title.trim()} body={body} isSaving={isSaving} message={message} onSave={(status) => void save(status)} /> : null}
    </main>
  );
}
