/**
 * PL: Testy filmu z YouTube we wpisie: poprawny identyfikator daje miniaturę albo ramkę bez autoodtwarzania, zły identyfikator nic nie rysuje, a brak sieci daje napis z linkiem. Test oblewa, gdy ktoś doda autoodtwarzanie, usunie leniwe ładowanie albo sprawdzanie identyfikatora.
 * EN: Tests of the YouTube video in an entry: a good id gives a thumbnail or a frame without autoplay, a bad id draws nothing, and no network gives a note with a link. The test fails when someone adds autoplay, removes lazy loading or removes the id check.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/news/feed/content/YouTubePlayer.tsx::YouTubePlayer
 * @uses src/features/news/feed/content/YouTubePlayer.tsx::YouTubeFrame
 * @used_by vitest.config.ts::include
 */

// PL: Rysowanie komponentu do tekstu HTML, bez przeglądarki.
// EN: Drawing a component to HTML text, without a browser.
import { renderToStaticMarkup } from 'react-dom/server';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { afterEach, describe, expect, it, vi } from 'vitest';
// PL: Komponenty, które sprawdzamy.
// EN: The components under test.
import { YouTubeFrame, YouTubePlayer } from './YouTubePlayer';

// PL: Poprawny identyfikator filmu (11 znaków).
// EN: A good video id (11 characters).
const GOOD_ID = 'dQw4w9WgXcQ';

// PL: Stan sieci w teście: brak sieci, a potem przywrócenie.
// EN: The network state in the test: no network, and then restoring it.
afterEach(() => {
  vi.unstubAllGlobals();
});

// PL: Grupa testów poprawnego identyfikatora.
// EN: A group of good id tests.
describe('YouTubePlayer: poprawny identyfikator / a good id', () => {
  // PL: Przed kliknięciem jest miniatura jako przycisk i nie ma ramki.
  // EN: Before a click there is a thumbnail as a button and no frame.
  it('pokazuje miniaturę bez ramki / shows the thumbnail without a frame', () => {
    const output = renderToStaticMarkup(<YouTubePlayer videoId={GOOD_ID} />);

    expect(output).toContain(`https://i.ytimg.com/vi/${GOOD_ID}/hqdefault.jpg`);
    expect(output).toContain('aria-label="Odtwórz film"');
    expect(output).not.toContain('<iframe');
  });

  // PL: Ramka idzie tylko z domeny youtube-nocookie.com, bez autoodtwarzania, z leniwym ładowaniem i pełnym ekranem.
  // EN: The frame comes only from the youtube-nocookie.com domain, without autoplay, with lazy loading and full screen.
  it('ramka: nocookie, bez autoodtwarzania, leniwe ładowanie / frame: nocookie, no autoplay, lazy loading', () => {
    const output = renderToStaticMarkup(<YouTubeFrame videoId={GOOD_ID} />);

    expect(output).toContain(`src="https://www.youtube-nocookie.com/embed/${GOOD_ID}?rel=0"`);
    expect(output).not.toContain('autoplay');
    expect(output).toContain('title="Film z YouTube"');
    expect(output).toContain('loading="lazy"');
    // PL: Tekst HTML z React zapisuje tę flagę jako allowFullScreen, a przeglądarka czyta ją bez względu na wielkość liter.
    // EN: The HTML text from React writes this flag as allowFullScreen, and the browser reads it regardless of letter case.
    expect(output).toMatch(/allowFullScreen|allowfullscreen/i);
    expect(output).toContain('news-video__frame');
  });
});

// PL: Grupa testów złego identyfikatora.
// EN: A group of bad id tests.
describe('YouTubePlayer: zły identyfikator / a bad id', () => {
  // PL: Zły identyfikator nie daje nic: ani miniatury, ani ramki, ani linku.
  // EN: A bad id gives nothing: no thumbnail, no frame, no link.
  it.each(['', 'za-krotki', 'dQw4w9WgXcQ"', 'x" onload="alert(1)', 'dQw4w9WgXc!'])('nic nie rysuje dla %j / draws nothing for %j', (videoId) => {
    expect(renderToStaticMarkup(<YouTubePlayer videoId={videoId} />)).toBe('');
  });
});

// PL: Grupa testów braku sieci.
// EN: A group of no-network tests.
describe('YouTubePlayer: brak sieci / no network', () => {
  // PL: Bez sieci zamiast miniatury jest napis z linkiem do YouTube, z target i rel.
  // EN: Without a network, instead of the thumbnail there is a note with a link to YouTube, with target and rel.
  it('pokazuje napis z linkiem zamiast miniatury / shows a note with a link instead of the thumbnail', () => {
    vi.stubGlobal('navigator', { onLine: false });

    const output = renderToStaticMarkup(<YouTubePlayer videoId={GOOD_ID} />);

    expect(output).toContain('Obejrzyj na YouTube');
    expect(output).toContain(`href="https://www.youtube.com/watch?v=${GOOD_ID}"`);
    expect(output).toContain('target="_blank"');
    expect(output).toContain('rel="noopener noreferrer"');
    expect(output).not.toContain('<iframe');
    expect(output).not.toContain('<button');
  });

  // PL: Gdy przeglądarka nie podaje stanu sieci (wartość undefined, jak w Node), miniatura zostaje.
  // EN: When the browser gives no network state (the value undefined, as in Node), the thumbnail stays.
  it('bez wartości onLine zostaje miniatura / without an onLine value the thumbnail stays', () => {
    vi.stubGlobal('navigator', {});

    const output = renderToStaticMarkup(<YouTubePlayer videoId={GOOD_ID} />);

    expect(output).toContain('aria-label="Odtwórz film"');
    expect(output).not.toContain('Obejrzyj na YouTube');
  });
});
