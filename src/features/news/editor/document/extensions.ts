/**
 * PL: Lista dozwolonych elementów wpisu: jedno miejsce, z którego korzystają telefon (edytor i podgląd) i serwer (schemat sprawdzający treść). Zawiera akapity, nagłówki 2 i 3, pogrubienie, kursywę, podkreślenie, listy, cytat, link https i własne węzły. Wyłączone są blok kodu, kod w linii, przekreślenie i linia pozioma (ADR 0002).
 * EN: The allowed entry element list: one place used by the phone (the editor and the preview) and the server (the schema that checks the content). It holds paragraphs, headings 2 and 3, bold, italic, underline, lists, a quote, an https link and the custom nodes. The code block, inline code, strikethrough and horizontal rule are off (ADR 0002).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/document/nodes.ts::YouTubeVideo
 * @used_by src/features/news/editor/RichEditor.tsx::NEWS_EXTENSIONS
 * @used_by worker/news/editor/validateBody.ts::NEWS_EXTENSIONS
 */

// PL: StarterKit zbiera podstawowe elementy edytora.
// EN: StarterKit gathers the basic editor elements.
import StarterKit from '@tiptap/starter-kit';
import { CaptionedImage, LinkCard, Sources, YouTubeVideo } from './nodes';

/**
 * PL: Rozszerzenia edytora i schematu. Nagłówki tylko poziomu 2 i 3, bo „h1” jest tytułem wpisu (tak czyta je podtor 3a). Link tylko https, otwierany w nowej karcie z rel="noopener noreferrer", a kliknięcie nie przechodzi pod adres, żeby dało się go edytować dotykiem.
 * EN: The editor and schema extensions. Headings only at levels 2 and 3, because "h1" is the entry title (subtrack 3a reads them this way). A link only https, opened in a new tab with rel="noopener noreferrer", and a click does not follow the address, so it can be edited by touch.
 */
export const NEWS_EXTENSIONS = [
  StarterKit.configure({
    heading: { levels: [2, 3] },
    code: false,
    codeBlock: false,
    strike: false,
    horizontalRule: false,
    link: {
      protocols: ['https'],
      defaultProtocol: 'https',
      openOnClick: false,
      HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' },
    },
  }),
  YouTubeVideo,
  CaptionedImage,
  LinkCard,
  Sources,
];
