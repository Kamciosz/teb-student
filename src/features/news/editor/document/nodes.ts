/**
 * PL: Własne elementy treści wpisu, których nie ma w Tiptap: film z YouTube (zapisuje tylko identyfikator), zdjęcie z podpisem, karta linku do mediów społecznościowych i sekcja „Źródła”. Są to czyste definicje węzłów (bez Reacta), więc serwer też buduje z nich schemat. W edytorze film i zdjęcie rysuje przeglądarka z ich HTML (miniatura filmu, zdjęcie z podpisem).
 * EN: The custom content elements Tiptap does not have: a YouTube video (stores only the id), a photo with a caption, a social media link card and the "Źródła" (sources) section. They are pure node definitions (no React), so the server builds its schema from them too. In the editor the browser draws the video and the photo from their HTML (a video thumbnail, a photo with a caption).
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/document/urls.ts::socialNetworkName
 * @used_by src/features/news/editor/document/extensions.ts::NEWS_EXTENSIONS
 */

// PL: Node to definicja własnego węzła dokumentu w Tiptap.
// EN: Node is the definition of a custom document node in Tiptap.
import { Node } from '@tiptap/core';
import { socialNetworkName } from './urls';

// PL: Miniatura filmu z YouTube, ta sama co w czytniku (podtor 3a) i w odtwarzaczu.
// EN: The YouTube video thumbnail, the same as in the reader (subtrack 3a) and in the player.
const THUMB_URL = 'https://i.ytimg.com/vi';

/**
 * PL: Film z YouTube. Zapisuje wyłącznie identyfikator (attrs.videoId), bez adresu ramki. Nazwa „youtube” i pole „videoId” czyta czytnik wpisu w podtorze 3a.
 * EN: A YouTube video. Stores only the id (attrs.videoId), without a frame address. The name "youtube" and the "videoId" field are read by the entry reader in subtrack 3a.
 */
export const YouTubeVideo = Node.create({
  name: 'youtube',
  group: 'block',
  // PL: Film to jeden niepodzielny klocek: nie da się w nim pisać.
  // EN: A video is one indivisible block: you cannot type inside it.
  atom: true,
  draggable: true,
  addAttributes() {
    return { videoId: { default: null } };
  },
  parseHTML() {
    // PL: Wklejony HTML jest rozpoznawany tylko w naszym własnym kształcie. Obce ramki są pomijane.
    // EN: Pasted HTML is recognised only in our own shape. Foreign frames are skipped.
    return [{ tag: 'div[data-youtube-video]', getAttrs: (element) => ({ videoId: element.getAttribute('data-youtube-video') }) }];
  },
  renderHTML({ node }) {
    // PL: W edytorze film to miniatura. Prawdziwy odtwarzacz jest tylko u ucznia i dopiero po kliknięciu.
    // EN: In the editor a video is a thumbnail. The real player exists only for the student and only after a click.
    const videoId = String(node.attrs.videoId);
    return ['div', { 'data-youtube-video': videoId, class: 'editor-video' }, ['img', { src: `${THUMB_URL}/${videoId}/hqdefault.jpg`, alt: 'Film z YouTube', width: '480', height: '360' }]];
  },
});

/**
 * PL: Zdjęcie z podpisem. Adres zdjęcia musi być https (sprawdza serwer). Wymiary rezerwują miejsce na ekranie, żeby wpis nie skakał podczas ładowania.
 * EN: A photo with a caption. The photo address must be https (the server checks it). The dimensions reserve space on the screen so the entry does not jump while loading.
 */
export const CaptionedImage = Node.create({
  name: 'image',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    // PL: Opis dla czytnika ekranu, podpis pod zdjęciem i wymiary w pikselach. Podpis i opis są tekstem, nigdy HTML.
    // EN: The description for a screen reader, the caption under the photo and the dimensions in pixels. The caption and the description are text, never HTML.
    return { src: { default: null }, alt: { default: '' }, caption: { default: '' }, width: { default: null }, height: { default: null } };
  },
  parseHTML() {
    return [
      {
        tag: 'figure[data-news-image]',
        getAttrs: (element) => {
          const image = element.querySelector('img');
          return { src: image?.getAttribute('src') ?? null, alt: image?.getAttribute('alt') ?? '', caption: element.querySelector('figcaption')?.textContent ?? '' };
        },
      },
    ];
  },
  renderHTML({ node }) {
    // PL: Zdjęcie leniwie ładowane, z podpisem w figcaption.
    // EN: A lazily loaded photo with the caption in a figcaption.
    const { src, alt, caption, width, height } = node.attrs;
    const image = ['img', { src, alt, width, height, loading: 'lazy' }];
    return ['figure', { 'data-news-image': '', class: 'editor-figure' }, image, ['figcaption', String(caption)]];
  },
});

/**
 * PL: Karta linku do mediów społecznościowych (Instagram, TikTok, Facebook, X). Pokazuje nazwę serwisu i adres, nie osadza treści, bo osadzenie ładowałoby śledzenie serwisu.
 * EN: A link card to social media (Instagram, TikTok, Facebook, X). Shows the network name and the address, does not embed the content, because embedding would load the network's tracking.
 */
export const LinkCard = Node.create({
  name: 'linkCard',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { href: { default: null } };
  },
  parseHTML() {
    return [{ tag: 'div[data-link-card]', getAttrs: (element) => ({ href: element.getAttribute('data-link-card') }) }];
  },
  renderHTML({ node }) {
    // PL: Nazwa serwisu (albo ogólny napis dla obcej domeny, której serwer i tak nie przyjmie) i sam adres.
    // EN: The network name (or a generic label for a foreign domain the server would reject anyway) and the plain address.
    const href = String(node.attrs.href);
    return ['div', { 'data-link-card': href, class: 'editor-card' }, ['strong', socialNetworkName(href) ?? 'Link'], ['span', href]];
  },
});

/**
 * PL: Sekcja „Źródła” na końcu artykułu: lista adresów https (attrs.urls). Czytnik pokazuje przy każdym domenę, żeby było widać, dokąd prowadzi.
 * EN: The "Źródła" (sources) section at the end of an article: a list of https addresses (attrs.urls). The reader shows the domain next to each, so it is visible where it leads.
 */
export const Sources = Node.create({
  name: 'sources',
  group: 'block',
  atom: true,
  draggable: true,
  addAttributes() {
    return { urls: { default: [] } };
  },
  parseHTML() {
    return [{ tag: 'div[data-sources]', getAttrs: (element) => ({ urls: (element.getAttribute('data-sources') ?? '').split('\n').filter(Boolean) }) }];
  },
  renderHTML({ node }) {
    // PL: W edytorze sekcja to nagłówek i lista adresów.
    // EN: In the editor the section is a heading and a list of addresses.
    const urls = (node.attrs.urls as string[]).map((url) => ['li', url]);
    return ['div', { 'data-sources': (node.attrs.urls as string[]).join('\n'), class: 'editor-sources' }, ['strong', 'Źródła'], ['ul', ...urls]];
  },
});
