/**
 * PL: Film z YouTube we wpisie. Najpierw pokazuje miniaturę z przyciskiem, a ramkę z youtube-nocookie.com wstawia dopiero po kliknięciu (ADR 0002), więc samo otwarcie wpisu nie ładuje odtwarzacza.
 * EN: A YouTube video in an entry. It first shows a thumbnail with a button, and inserts the youtube-nocookie.com frame only after a click (ADR 0002), so merely opening an entry does not load the player.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/news/feed/content/RichContent.tsx::YouTubePlayer
 */

// PL: Stan „kliknięto”.
// EN: The "clicked" state.
import { useState } from 'react';

// PL: Wymiary miniatury hqdefault. Atrybuty width i height rezerwują miejsce, zanim zdjęcie się wczyta.
// EN: The hqdefault thumbnail dimensions. The width and height attributes reserve the space before the image loads.
const THUMB_WIDTH = 480;
const THUMB_HEIGHT = 360;

/**
 * PL: Dane odtwarzacza.
 * EN: Player data.
 */
export type YouTubePlayerProps = {
  /** PL: Sprawdzony identyfikator filmu (11 znaków). EN: The validated video id (11 characters). */
  videoId: string;
};

/**
 * PL: Rysuje miniaturę filmu, a po kliknięciu odtwarzacz.
 * EN: Draws the video thumbnail, and the player after a click.
 *
 * @param props - PL: identyfikator filmu. EN: the video id.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  // PL: Czy uczeń kliknął miniaturę.
  // EN: Whether the student clicked the thumbnail.
  const [playing, setPlaying] = useState(false);

  // PL: Po kliknięciu wstaw ramkę z domeny bez ciasteczek śledzących.
  // EN: After a click, insert the frame from the domain without tracking cookies.
  if (playing) {
    return (
      <div className="news-video">
        <iframe
          className="news-video__frame"
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title="Film z YouTube"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      </div>
    );
  }

  // PL: Przed kliknięciem pokaż miniaturę jako przycisk.
  // EN: Before a click, show the thumbnail as a button.
  return (
    <button type="button" className="news-video news-video--thumb" aria-label="Odtwórz film" onClick={() => setPlaying(true)}>
      <img
        className="news-video__image"
        src={`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`}
        alt=""
        width={THUMB_WIDTH}
        height={THUMB_HEIGHT}
        loading="lazy"
      />
      <span className="news-video__play" aria-hidden="true">
        ▶
      </span>
    </button>
  );
}
