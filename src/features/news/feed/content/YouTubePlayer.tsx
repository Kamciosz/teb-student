/**
 * PL: Film z YouTube we wpisie. Najpierw pokazuje miniaturę z przyciskiem, a ramkę z youtube-nocookie.com wstawia dopiero po kliknięciu (ADR 0002), więc samo otwarcie wpisu nie ładuje odtwarzacza. Bez internetu zamiast miniatury i ramki pokazuje napis z linkiem do YouTube. Identyfikator sprawdza ponownie wzorzec z sanitize.ts, a gdy jest zły, nic nie rysuje.
 * EN: A YouTube video in an entry. It first shows a thumbnail with a button, and inserts the youtube-nocookie.com frame only after a click (ADR 0002), so merely opening an entry does not load the player. Without internet it shows a note with a link to YouTube instead of the thumbnail and the frame. It checks the id against the pattern from sanitize.ts again, and when the id is bad, it draws nothing.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/content/sanitize.ts::safeVideoId
 * @used_by src/features/news/feed/content/RichContent.tsx::YouTubePlayer
 * @used_by src/features/news/feed/content/YouTubePlayer.test.tsx::YouTubeFrame
 */

// PL: Stan „kliknięto”, stan „bez sieci” i efekt do słuchania zdarzeń sieci.
// EN: The "clicked" state, the "no network" state and the effect that listens for network events.
import { useEffect, useState } from 'react';
// PL: Sprawdzenie kształtu identyfikatora (ten sam wzorzec co przy czyszczeniu treści).
// EN: The check of the id shape (the same pattern as in content cleaning).
import { safeVideoId } from './sanitize';

// PL: Wymiary miniatury hqdefault. Atrybuty width i height rezerwują miejsce, zanim zdjęcie się wczyta.
// EN: The hqdefault thumbnail dimensions. The width and height attributes reserve the space before the image loads.
const THUMB_WIDTH = 480;
const THUMB_HEIGHT = 360;

/**
 * PL: Dane odtwarzacza.
 * EN: Player data.
 */
export type YouTubePlayerProps = {
  /** PL: Identyfikator filmu (11 znaków), sprawdzany w komponencie. EN: The video id (11 characters), checked in the component. */
  videoId: string;
};

/**
 * PL: Sprawdza, czy przeglądarka jest bez sieci. W testach w Node pole navigator.onLine jest undefined, więc sprawdzamy tylko wartość false.
 * EN: Checks whether the browser is offline. In Node tests the navigator.onLine field is undefined, so we check only for the value false.
 *
 * @returns PL: prawda, gdy brak sieci. EN: true when there is no network.
 */
function readOffline(): boolean {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

/**
 * PL: Zwraca, czy brak sieci, i śledzi zdarzenia „online” i „offline” w oknie.
 * EN: Returns whether there is no network, and follows the "online" and "offline" events in the window.
 *
 * @returns PL: prawda, gdy brak sieci. EN: true when there is no network.
 */
function useOffline(): boolean {
  // PL: Stan startowy z przeglądarki, potem aktualizowany zdarzeniami.
  // EN: The starting state from the browser, then updated by the events.
  const [offline, setOffline] = useState(readOffline);

  useEffect(() => {
    // PL: Zdarzenia zmieniają stan, a sprzątanie usuwa słuchaczy po odmontowaniu.
    // EN: The events change the state, and the cleanup removes the listeners on unmount.
    const goOffline = () => setOffline(true);
    const goOnline = () => setOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    return () => {
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, []);

  return offline;
}

/**
 * PL: Rysuje ramkę odtwarzacza z youtube-nocookie.com. Bez autoodtwarzania, z leniwym ładowaniem i proporcją 16:9 z CSS.
 * EN: Draws the player frame from youtube-nocookie.com. No autoplay, lazy loading, and the 16:9 ratio from the CSS.
 *
 * @param props - PL: identyfikator filmu. EN: the video id.
 * @returns PL: element ramki. EN: the frame element.
 */
export function YouTubeFrame({ videoId }: YouTubePlayerProps) {
  return (
    <div className="news-video">
      <iframe
        className="news-video__frame"
        src={`https://www.youtube-nocookie.com/embed/${videoId}?rel=0`}
        title="Film z YouTube"
        allow="encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        loading="lazy"
        referrerPolicy="strict-origin-when-cross-origin"
      />
    </div>
  );
}

/**
 * PL: Rysuje napis dla ucznia bez internetu z linkiem do filmu na YouTube. Link ma target i rel jak pozostałe linki.
 * EN: Draws the note for a student without internet, with a link to the video on YouTube. The link has target and rel like the other links.
 *
 * @param props - PL: identyfikator filmu. EN: the video id.
 * @returns PL: element z napisem. EN: the element with the note.
 */
function OfflineNote({ videoId }: YouTubePlayerProps) {
  return (
    <p className="news-video-offline">
      Film wymaga połączenia z internetem. <a href={`https://www.youtube.com/watch?v=${videoId}`} target="_blank" rel="noopener noreferrer">Obejrzyj na YouTube</a>
    </p>
  );
}

/**
 * PL: Rysuje miniaturę filmu, a po kliknięciu odtwarzacz. Bez internetu pokazuje napis z linkiem. Zły identyfikator daje nic.
 * EN: Draws the video thumbnail, and the player after a click. Without internet it shows a note with a link. A bad id gives nothing.
 *
 * @param props - PL: identyfikator filmu. EN: the video id.
 * @returns PL: drzewo elementów albo null. EN: the element tree or null.
 */
export function YouTubePlayer({ videoId }: YouTubePlayerProps) {
  // PL: Czy uczeń kliknął miniaturę.
  // EN: Whether the student clicked the thumbnail.
  const [playing, setPlaying] = useState(false);
  // PL: Czy brak sieci.
  // EN: Whether there is no network.
  const offline = useOffline();

  // PL: Zły identyfikator nie daje ani miniatury, ani ramki, ani linku.
  // EN: A bad id gives neither a thumbnail, nor a frame, nor a link.
  const id = safeVideoId(videoId);
  if (id === null) return null;

  // PL: Bez sieci miniatura i ramka nie zadziałają, więc pokazujemy napis z linkiem.
  // EN: Without a network the thumbnail and the frame would not work, so we show a note with a link.
  if (offline) return <OfflineNote videoId={id} />;

  // PL: Po kliknięciu wstaw ramkę.
  // EN: After a click, insert the frame.
  if (playing) return <YouTubeFrame videoId={id} />;

  // PL: Przed kliknięciem pokaż miniaturę jako przycisk.
  // EN: Before a click, show the thumbnail as a button.
  return (
    <button type="button" className="news-video news-video--thumb" aria-label="Odtwórz film" onClick={() => setPlaying(true)}>
      <img
        className="news-video__image"
        src={`https://i.ytimg.com/vi/${id}/hqdefault.jpg`}
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
