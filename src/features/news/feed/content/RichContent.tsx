/**
 * PL: Rysuje treść wpisu własnymi komponentami Reacta, bez Tiptapa i bez wstawiania HTML. Rysuje tylko to, co zostawi sanitizeDocument. Linki mają target="_blank" i rel="noopener noreferrer".
 * EN: Draws the entry content with its own React components, without Tiptap and without injecting HTML. It draws only what sanitizeDocument leaves. Links have target="_blank" and rel="noopener noreferrer".
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/content/sanitize.ts::sanitizeDocument
 * @uses src/features/news/feed/content/YouTubePlayer.tsx::YouTubePlayer
 * @used_by src/features/news/feed/EntryScreen.tsx::RichContent
 * @used_by src/features/news/feed/content/sanitize.test.tsx::RichContent
 */

// PL: Typ elementu React.
// EN: The React element type.
import type { ReactNode } from 'react';
// PL: Czyszczenie treści i typy bloków.
// EN: Content cleaning and block types.
import { sanitizeDocument, type SafeBlock, type SafeInline } from './sanitize';
// PL: Odtwarzacz filmu.
// EN: The video player.
import { YouTubePlayer } from './YouTubePlayer';

/**
 * PL: Rysuje jeden fragment linii: tekst ze stylem i linkiem albo łamanie wiersza.
 * EN: Draws one inline piece: text with style and link, or a line break.
 *
 * @param piece - PL: bezpieczny fragment. EN: a safe piece.
 * @param key - PL: klucz elementu. EN: the element key.
 * @returns PL: element. EN: an element.
 */
function renderInline(piece: SafeInline, key: number): ReactNode {
  if (piece.kind === 'break') return <br key={key} />;
  // PL: Style zagnieżdżamy od wewnątrz: tekst, podkreślenie, kursywa, pogrubienie, link.
  // EN: We nest styles from the inside: text, underline, italic, bold, link.
  let node: ReactNode = piece.text;
  if (piece.underline) node = <u>{node}</u>;
  if (piece.italic) node = <em>{node}</em>;
  if (piece.bold) node = <strong>{node}</strong>;
  if (piece.href === null) return <span key={key}>{node}</span>;
  return (
    <a key={key} href={piece.href} target="_blank" rel="noopener noreferrer">
      {node}
    </a>
  );
}

/**
 * PL: Rysuje fragmenty linii.
 * EN: Draws inline pieces.
 *
 * @param pieces - PL: lista fragmentów. EN: the list of pieces.
 * @returns PL: lista elementów. EN: the list of elements.
 */
function renderInlines(pieces: SafeInline[]): ReactNode[] {
  return pieces.map(renderInline);
}

/**
 * PL: Rysuje jeden blok treści.
 * EN: Draws one content block.
 *
 * @param block - PL: bezpieczny blok. EN: a safe block.
 * @param key - PL: klucz elementu. EN: the element key.
 * @returns PL: element. EN: an element.
 */
function renderBlock(block: SafeBlock, key: number): ReactNode {
  switch (block.kind) {
    case 'paragraph':
      return <p key={key}>{renderInlines(block.children)}</p>;
    case 'heading':
      return block.level === 2 ? <h2 key={key}>{renderInlines(block.children)}</h2> : <h3 key={key}>{renderInlines(block.children)}</h3>;
    case 'list': {
      const items = block.items.map((item, index) => <li key={index}>{renderBlocks(item)}</li>);
      return block.ordered ? <ol key={key}>{items}</ol> : <ul key={key}>{items}</ul>;
    }
    case 'quote':
      return <blockquote key={key}>{renderBlocks(block.children)}</blockquote>;
    case 'youtube':
      return <YouTubePlayer key={key} videoId={block.videoId} />;
  }
}

/**
 * PL: Rysuje listę bloków.
 * EN: Draws a list of blocks.
 *
 * @param blocks - PL: lista bloków. EN: the list of blocks.
 * @returns PL: lista elementów. EN: the list of elements.
 */
function renderBlocks(blocks: SafeBlock[]): ReactNode[] {
  return blocks.map(renderBlock);
}

/**
 * PL: Dane komponentu treści.
 * EN: Content component data.
 */
export type RichContentProps = {
  /** PL: Treść wpisu z serwera (dokument JSON). Komponent sam ją czyści. EN: The entry content from the server (a JSON document). The component cleans it itself. */
  body: unknown;
};

/**
 * PL: Rysuje treść wpisu po oczyszczeniu.
 * EN: Draws the entry content after cleaning.
 *
 * @param props - PL: treść wpisu. EN: the entry content.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function RichContent({ body }: RichContentProps) {
  return <div className="news-content">{renderBlocks(sanitizeDocument(body))}</div>;
}
