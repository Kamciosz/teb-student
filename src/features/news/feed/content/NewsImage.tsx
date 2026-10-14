/**
 * PL: Rysuje zdjęcie z wpisu w elemencie „figure” z opcjonalnym podpisem. Zdjęcie ładuje się leniwie, a wymiary dają przeglądarce miejsce przed pobraniem.
 * EN: Draws an entry photo in a "figure" element with an optional caption. The photo loads lazily, and the dimensions give the browser room before the download.
 *
 * @author Szymon
 * @since 2026-10-14
 * @used_by src/features/news/feed/content/RichContent.tsx::renderBlock
 * @used_by src/features/news/feed/content/NewsImage.test.tsx::NewsImage
 */

/**
 * PL: Dane zdjęcia z treści wpisu po oczyszczeniu.
 * EN: Photo data from the entry content after cleaning.
 */
export type NewsImageProps = {
  /** PL: Adres zdjęcia z własnego serwera (/api/media/...). EN: The photo address from our own server (/api/media/...). */
  src: string;
  /** PL: Tekst zastępczy dla czytników ekranu. EN: The alternative text for screen readers. */
  alt: string;
  /** PL: Podpis pod zdjęciem; pusty tekst oznacza brak podpisu. EN: The caption under the photo; empty text means no caption. */
  caption: string;
  /** PL: Szerokość w pikselach albo null, gdy nie jest znana. EN: The width in pixels, or null when not known. */
  width: number | null;
  /** PL: Wysokość w pikselach albo null, gdy nie jest znana. EN: The height in pixels, or null when not known. */
  height: number | null;
};

/**
 * PL: Rysuje zdjęcie z podpisem (jeśli jest).
 * EN: Draws a photo with its caption (if there is one).
 *
 * @param props - PL: dane zdjęcia. EN: the photo data.
 * @returns PL: element zdjęcia. EN: the photo element.
 */
export function NewsImage({ src, alt, caption, width, height }: NewsImageProps) {
  return (
    <figure className="news-image">
      <img src={src} alt={alt} loading="lazy" width={width ?? undefined} height={height ?? undefined} />
      {caption !== '' && <figcaption>{caption}</figcaption>}
    </figure>
  );
}
