/**
 * PL: Pasek narzędzi edytora (styl ekranu 5.2: przyciski 44 × 44 px, zawijane do kolejnego wiersza, więc przy 320 px nic nie wychodzi poza ekran). Ma formatowanie tekstu, listy, cytat, link, film z YouTube, kartę linku, źródła, zdjęcie, opis i podpis zdjęcia oraz cofnij i ponów. Przyciski adresów otwierają okienko AddressPanel, a przycisk opisu okienko PhotoCaptionPanel.
 * EN: The editor toolbar (the style of screen 5.2: 44 × 44 px buttons, wrapped to the next row, so at 320 px nothing goes off the screen). It has text formatting, lists, a quote, a link, a YouTube video, a link card, sources, a photo, the photo description and caption, and undo and redo. The address buttons open the AddressPanel, and the description button opens the PhotoCaptionPanel.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/AddressPanel.tsx::AddressPanel
 * @uses src/features/news/editor/PhotoButton.tsx::PhotoButton
 * @uses src/features/news/editor/PhotoCaptionPanel.tsx::PhotoCaptionPanel
 * @uses src/features/news/editor/photoCaption.ts::selectedPhotoOf
 * @uses src/features/news/editor/photoCaption.ts::findPhotoPos
 * @uses src/features/news/editor/texts.ts::TO_AGREE
 * @used_by src/features/news/editor/RichEditor.tsx::EditorToolbar
 */

import type { Editor } from '@tiptap/core';
import { useEditorState } from '@tiptap/react';
import { useEffect, useState } from 'react';
import { AddressPanel, type AddressKind } from './AddressPanel';
import { PhotoButton } from './PhotoButton';
import { PhotoCaptionPanel } from './PhotoCaptionPanel';
import { findPhotoPos, selectedPhotoOf } from './photoCaption';
import { TO_AGREE } from './texts';

/**
 * PL: Opis jednego przycisku formatowania: napis na przycisku, opis dla czytnika ekranu, czy jest włączony i co robi.
 * EN: The description of one formatting button: the label on the button, the screen reader description, whether it is on and what it does.
 */
type FormatButton = { id: string; text: string; label: string; isOn: (editor: Editor) => boolean; run: (editor: Editor) => void };

// PL: Przyciski formatowania w kolejności na pasku. Każdy działa na zaznaczeniu albo w miejscu kursora.
// EN: The formatting buttons in toolbar order. Each works on the selection or at the cursor.
const FORMAT_BUTTONS: FormatButton[] = [
  { id: 'bold', text: 'B', label: TO_AGREE.buttons.bold, isOn: (e) => e.isActive('bold'), run: (e) => e.chain().focus().toggleBold().run() },
  { id: 'italic', text: 'I', label: TO_AGREE.buttons.italic, isOn: (e) => e.isActive('italic'), run: (e) => e.chain().focus().toggleItalic().run() },
  { id: 'underline', text: 'U', label: TO_AGREE.buttons.underline, isOn: (e) => e.isActive('underline'), run: (e) => e.chain().focus().toggleUnderline().run() },
  { id: 'h2', text: 'H2', label: TO_AGREE.buttons.heading2, isOn: (e) => e.isActive('heading', { level: 2 }), run: (e) => e.chain().focus().toggleHeading({ level: 2 }).run() },
  { id: 'h3', text: 'H3', label: TO_AGREE.buttons.heading3, isOn: (e) => e.isActive('heading', { level: 3 }), run: (e) => e.chain().focus().toggleHeading({ level: 3 }).run() },
  { id: 'ul', text: '•', label: TO_AGREE.buttons.bulletList, isOn: (e) => e.isActive('bulletList'), run: (e) => e.chain().focus().toggleBulletList().run() },
  { id: 'ol', text: '1.', label: TO_AGREE.buttons.orderedList, isOn: (e) => e.isActive('orderedList'), run: (e) => e.chain().focus().toggleOrderedList().run() },
  { id: 'quote', text: '“', label: TO_AGREE.buttons.quote, isOn: (e) => e.isActive('blockquote'), run: (e) => e.chain().focus().toggleBlockquote().run() },
];

// PL: Przyciski, które otwierają okienko z adresem, i napisy na nich.
// EN: The buttons that open the address panel, and their labels.
const ADDRESS_BUTTONS: { kind: AddressKind; text: string; label: string }[] = [
  { kind: 'link', text: 'Link', label: TO_AGREE.buttons.link },
  { kind: 'video', text: 'Film', label: TO_AGREE.buttons.video },
  { kind: 'card', text: 'Karta', label: TO_AGREE.buttons.card },
  { kind: 'sources', text: 'Źródła', label: TO_AGREE.buttons.sources },
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

  // PL: Zaznacza zdjęcie w dokumencie i otwiera okienko opisu. EN: Selects the photo in the document and opens the description panel.
  function openPhotoPanel(src: string): void {
    const pos = findPhotoPos(editor.state.doc, src);
    if (pos === null) return;
    editor.chain().focus().setNodeSelection(pos).run();
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
      <div className="editor-toolbar" role="toolbar" aria-label={TO_AGREE.toolbarLabel}>
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
        <PhotoButton editor={editor} onInserted={setInsertedSrc} />
        {/* PL: Opis i podpis zdjęcia, gdy zdjęcie jest zaznaczone albo właśnie wstawione. EN: The photo description and caption, when a photo is selected or has just been inserted. */}
        {photoSrc !== null ? <button type="button" className="editor-tool" aria-label={TO_AGREE.buttons.caption} aria-pressed={open === 'photo'} onClick={() => openPhotoPanel(photoSrc)}>Opis</button> : null}
        {/* PL: Cofnij i ponów. EN: Undo and redo. */}
        <button type="button" className="editor-tool" aria-label={TO_AGREE.buttons.undo} disabled={!state.canUndo} onClick={() => editor.chain().focus().undo().run()}>↶</button>
        <button type="button" className="editor-tool" aria-label={TO_AGREE.buttons.redo} disabled={!state.canRedo} onClick={() => editor.chain().focus().redo().run()}>↷</button>
      </div>
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
