/**
 * PL: Pasek narzędzi edytora (styl ekranu 5.2: przyciski 44 × 44 px w jednym rzędzie). Przyciski formatowania, adresów, zdjęcia i opisu przewijają się w bok palcem, a cofnij i ponów stoją stale po prawej, więc przy 320 px pasek nie zabiera pół ekranu. Ma formatowanie tekstu, listy, cytat, link, film z YouTube, kartę linku, źródła, zdjęcie, opis i podpis zdjęcia oraz cofnij i ponów. Przyciski adresów otwierają okienko AddressPanel, a przycisk opisu okienko PhotoCaptionPanel. Komunikaty o wysyłce zdjęcia są pod paskiem, poza jego rzędem.
 * EN: The editor toolbar (the style of screen 5.2: 44 × 44 px buttons in one row). The formatting, address, photo and description buttons scroll sideways with a finger, and undo and redo stay on the right, so at 320 px the toolbar does not take half the screen. It has text formatting, lists, a quote, a link, a YouTube video, a link card, sources, a photo, the photo description and caption, and undo and redo. The address buttons open the AddressPanel, and the description button opens the PhotoCaptionPanel. The photo upload messages are under the toolbar, outside its row.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/AddressPanel.tsx::AddressPanel
 * @uses src/features/news/editor/PhotoButton.tsx::PhotoButton
 * @uses src/features/news/editor/PhotoCaptionPanel.tsx::PhotoCaptionPanel
 * @uses src/features/news/editor/photoCaption.ts::selectedPhotoOf
 * @uses src/features/news/editor/photoCaption.ts::findPhotoPos
 * @uses src/features/news/editor/texts.ts::TEXTS
 * @used_by src/features/news/editor/RichEditor.tsx::EditorToolbar
 */

import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { AddressPanel, type AddressKind } from './AddressPanel';
import { PhotoButton, type PhotoStatus } from './PhotoButton';
import { PhotoCaptionPanel } from './PhotoCaptionPanel';
import { findPhotoPos, selectedPhotoOf } from './photoCaption';
import { TEXTS } from './texts';

/**
 * PL: Opis jednego przycisku formatowania: napis na przycisku, opis dla czytnika ekranu, czy jest włączony i co robi.
 * EN: The description of one formatting button: the label on the button, the screen reader description, whether it is on and what it does.
 */
type FormatButton = { id: string; text: string; label: string; isOn: (editor: Editor) => boolean; run: (editor: Editor) => void };

// PL: Przyciski formatowania w kolejności na pasku. Każdy działa na zaznaczeniu albo w miejscu kursora.
// EN: The formatting buttons in toolbar order. Each works on the selection or at the cursor.
const FORMAT_BUTTONS: FormatButton[] = [
  { id: 'bold', text: 'B', label: TEXTS.buttons.bold, isOn: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { id: 'italic', text: 'I', label: TEXTS.buttons.italic, isOn: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  { id: 'underline', text: 'U', label: TEXTS.buttons.underline, isOn: (e) => e.isActive('underline'), run: (e) => e.chain().focus().toggleUnderline().run() },
  { id: 'h2', text: 'H2', label: TEXTS.buttons.heading2, isOn: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: 'h3', text: 'H3', label: TEXTS.buttons.heading3, isOn: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: 'ul', text: '•', label: TEXTS.buttons.bulletList, isOn: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { id: 'ol', text: '1.', label: TEXTS.buttons.orderedList, isOn: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: 'quote', text: '“', label: TEXTS.buttons.quote, isOn: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
];

// PL: Przyciski, które otwierają okienko z adresem, i napisy na nich.
// EN: The buttons that open the address panel, and their labels.
const ADDRESS_BUTTONS: { kind: AddressKind; text: string; label: string }[] = [
  { kind: 'link', text: 'Link', label: TEXTS.buttons.link },
  { kind: 'video', text: 'Film', label: TEXTS.buttons.video },
  { kind: 'card', text: 'Karta', label: TEXTS.buttons.card },
  { kind: 'sources', text: 'Źródła', label: TEXTS.buttons.sources },
];

/**
 * PL: Wstawia do dokumentu to, co wpisano w okienku adresu.
 * EN: Inserts into the document what was typed in the address panel.
 *
 * @param editor - PL: edytor. EN: the editor.
 * @param kind - PL: rodzaj okienka. EN: the panel kind.
 * @param value - PL: sprawdzona wartość: adres, identyfikator filmu albo lista źródeł. EN: the checked value: an address, a video id or a list of sources.
 */
function insertAddress(editor: Editor, kind: AddressKind, value: string | string[]): void {
  const chain = editor.chain().focus();
  if (kind === 'link') chain.extendMarkRange('link').setLink({ href: value as string }).run();
  if (kind === 'video') chain.insertContent({ type: 'youtube', attrs: { videoId: value } }).run();
  if (kind === 'card') chain.insertContent({ type: 'linkCard', attrs: { href: value } }).run();
  if (kind === 'sources') chain.insertContent({ type: 'sources', attrs: { urls: value } }).run();
}

/**
 * PL: Dane paska.
 * EN: Toolbar data.
 */
export type EditorToolbarProps = {
  /** PL: Edytor, którym pasek steruje. EN: The editor the toolbar controls. */
  editor: Editor;
};

/**
 * PL: Rysuje pasek narzędzi i okienko adresu, gdy jest otwarte.
 * EN: Draws the toolbar and the address panel when it is open.
 *
 * @param props - PL: edytor. EN: the editor.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function EditorToolbar({ editor }: EditorToolbarProps) {
  // PL: Które okienko jest otwarte (null: żadne).
  // EN: Which panel is open (null: none).
  const [open, setOpen] = useState<AddressKind | 'photo' | null>(null);
  // PL: Adres zdjęcia, które przed chwilą wstawiono. Przycisk „Opis i podpis” pokazuje się dla niego, dopóki kursor się nie ruszy.
  // EN: The address of the photo just inserted. The "Opis i podpis" button shows for it until the cursor moves.
  const [insertedSrc, setInsertedSrc] = useState<string | null>(null);
  // PL: Wysyłka zdjęcia i jej błąd. Trzymamy je tutaj, a nie w przycisku, bo komunikaty mają być pod paskiem, a nie w jego przewijanym rzędzie.
  // EN: The photo upload and its error. They are kept here, not in the button, because the messages go under the toolbar, not into its scrolling row.
  const [photoStatus, setPhotoStatus] = useState<PhotoStatus>({ sending: false, error: null });
  // PL: Stan przycisków czytamy z edytora przy każdej zmianie zaznaczenia.
  // EN: We read the button state from the editor on every selection change.
  const state = useEditorState({
    editor,
    selector: ({ editor: current }) => ({
      on: FORMAT_BUTTONS.map((button) => button.isOn(current)),
      linkHref: (current.getAttributes('link').href as string | undefined) ?? '',
      canUndo: current.can().undo(),
      canRedo: current.can().redo(),
      photo: selectedPhotoOf(current.state),
    }),
  });

  useEffect(() => {
    // PL: Każda zmiana zaznaczenia kończy pokazywanie świeżo wstawionego zdjęcia. Okienko zdjęcia zamyka się, gdy zaznaczenie przestaje być zdjęciem.
    // EN: Every selection change ends showing the freshly inserted photo. The photo panel closes when the selection stops being a photo.
    const onSelection = () => {
      setInsertedSrc(null);
      if (selectedPhotoOf(editor.state) === null) setOpen((current) => (current === 'photo' ? null : current));
    };
    editor.on('selectionUpdate', onSelection);
    return () => {
      editor.off('selectionUpdate', onSelection);
    };
  }, [editor]);

  // PL: Zaznacza zdjęcie i otwiera okienko opisu. Bez focus(): Tiptap oddaje fokus edytorowi w następnej klatce, więc zabrałby fokus polu okienka (autoFocus) i Escape trafiałby do edytora.
  // EN: Selects the photo and opens the description panel. No focus(): Tiptap gives the focus back to the editor on the next frame, so it would take the focus from the panel's field (autoFocus) and Escape would go to the editor.
  function openPhotoPanel(src: string): void {
    const pos = findPhotoPos(editor.state.doc, src);
    if (pos === null) return;
    editor.chain().setNodeSelection(pos).run();
    setOpen('photo');
  }

  // PL: Zamknięcie okienka oddaje fokus edytorowi, zaznaczenie zdjęcia zostaje. EN: Closing the panel gives the focus back to the editor, the photo selection stays.
  function closePhotoPanel(): void {
    setOpen(null);
    editor.commands.focus();
  }

  const photoSrc = state.photo?.src ?? insertedSrc;

  return (
    <>
      <div className="editor-toolbar" role="toolbar" aria-label={TEXTS.toolbarLabel}>
        {/* PL: Przewijany rząd: formatowanie, adresy, zdjęcie i opis. Przewija się w bok palcem, a jego przyciski się nie zwężają. EN: The scrolling row: formatting, addresses, the photo and the description. It scrolls sideways with a finger, and its buttons do not shrink. */}
        <div className="editor-toolbar__scroll">
          {/* PL: Formatowanie: wciśnięty przycisk znaczy, że w tym miejscu tekst ma ten styl. EN: Formatting: a pressed button means the text here has that style. */}
          {FORMAT_BUTTONS.map((button, index) => (
            <button key={button.id} type="button" className="editor-tool" aria-label={button.label} aria-pressed={state.on[index]} onClick={() => button.run(editor)}>
              {button.text}
            </button>
          ))}
          {/* PL: Przyciski, które pytają o adres. EN: The buttons that ask for an address. */}
          {ADDRESS_BUTTONS.map((button) => (
            <button key={button.kind} type="button" className="editor-tool" aria-label={button.label} aria-pressed={open === button.kind || (button.kind === 'link' && state.linkHref !== '')} onClick={() => setOpen(button.kind)}>
              {button.text}
            </button>
          ))}
          {/* PL: Zdjęcie: wysyłka i wstawienie do treści. EN: Photo: upload and insertion into the content. */}
          <PhotoButton editor={editor} onInserted={setInsertedSrc} status={photoStatus} onStatus={setPhotoStatus} />
          {/* PL: Opis i podpis zdjęcia, gdy zdjęcie jest zaznaczone albo właśnie wstawione. EN: The photo description and caption, when a photo is selected or has just been inserted. */}
          {photoSrc !== null ? <button type="button" className="editor-tool" aria-label={TEXTS.buttons.caption} aria-pressed={open === 'photo'} onClick={() => openPhotoPanel(photoSrc)}>Opis</button> : null}
        </div>
        {/* PL: Cofnij i ponów stoją zawsze po prawej, poza przewijanym rzędem. EN: Undo and redo always stand on the right, outside the scrolling row. */}
        <div className="editor-toolbar__history">
          <button type="button" className="editor-tool" aria-label={TEXTS.buttons.undo} disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>↶</button>
          <button type="button" className="editor-tool" aria-label={TEXTS.buttons.redo} disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>↷</button>
        </div>
      </div>
      {/* PL: Komunikat o wysyłce i błąd pod paskiem. Błąd czyta czytnik ekranu. EN: The upload note and the error under the toolbar. A screen reader reads the error. */}
      {photoStatus.sending ? <p className="editor-toolbar__message" role="status">{TEXTS.photo.sending}</p> : null}
      {photoStatus.error ? <p className="editor-toolbar__message editor-error" role="alert">{photoStatus.error}</p> : null}
      {/* PL: Okienko adresu pod paskiem. Klucz zmienia się z rodzajem, więc pole zaczyna puste. EN: The address panel under the toolbar. The key changes with the kind, so the field starts empty. */}
      {open && open !== 'photo' ? (
        <AddressPanel
          key={open}
          kind={open}
          initial={open === 'link' ? state.linkHref : ''}
          onCancel={() => setOpen(null)}
          onRemove={open === 'link' && state.linkHref !== '' ? () => { editor.chain().focus().extendMarkRange('link').unsetLink().run(); setOpen(null); } : undefined}
          onSubmit={(value) => { insertAddress(editor, open, value); setOpen(null); }}
        />
      ) : null}
      {/* PL: Okienko opisu zdjęcia: klucz to adres, więc inne zdjęcie zaczyna z własnymi wartościami. EN: The photo description panel: the key is the address, so another photo starts with its own values. */}
      {open === 'photo' && state.photo ? (
        <PhotoCaptionPanel
          key={state.photo.src}
          alt={state.photo.alt}
          caption={state.photo.caption}
          onCancel={closePhotoPanel}
          onSubmit={(attrs) => { editor.chain().focus().updateAttributes('image', attrs).run(); setOpen(null); }}
        />
      ) : null}
    </>
  );
}
