/**
 * PL: Testy rysowania zdjęcia z treści wpisu. Sprawdzają, że zdjęcie ładuje się leniwie, podpis pojawia się tylko wtedy, gdy jest, a brak wymiarów nie psuje rysowania.
 * EN: Tests of drawing a photo from the entry content. They check that the photo loads lazily, the caption appears only when there is one, and missing dimensions do not break drawing.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/feed/content/NewsImage.tsx::NewsImage
 * @used_by vitest.config.ts::include
 */

// PL: Rysowanie komponentu do tekstu HTML, bez przeglądarki.
// EN: Drawing a component to HTML text, without a browser.
import { renderToStaticMarkup } from 'react-dom/server';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Komponent zdjęcia, który sprawdzamy.
// EN: The photo component under test.
import { NewsImage, type NewsImageProps } from './NewsImage';

// PL: Komplet danych zdjęcia z wymiarami i podpisem.
// EN: A full set of photo data with size and caption.
const full: NewsImageProps = { src: '/api/media/abc123', alt: 'Boisko', caption: 'Podpis', width: 800, height: 600 };

describe('NewsImage', () => {
  // PL: Zdjęcie ma leniwe ładowanie, adres, tekst zastępczy i wymiary.
  // EN: The photo has lazy loading, the address, the alternative text and the size.
  it('rysuje img z lazy, adresem, alt i wymiarami / draws an img with lazy, the address, alt and the size', () => {
    const output = renderToStaticMarkup(<NewsImage {...full} />);

    expect(output).toContain('<img src="/api/media/abc123" alt="Boisko" loading="lazy" width="800" height="600"/>');
  });

  // PL: Podpis pojawia się pod zdjęciem, gdy jest tekst.
  // EN: The caption appears under the photo when there is text.
  it('pokazuje podpis, gdy jest / shows the caption when there is one', () => {
    const output = renderToStaticMarkup(<NewsImage {...full} />);

    expect(output).toContain('<figcaption>Podpis</figcaption>');
  });

  // PL: Bez podpisu nie ma elementu figcaption.
  // EN: Without a caption there is no figcaption element.
  it('bez podpisu nie rysuje figcaption / without a caption draws no figcaption', () => {
    const output = renderToStaticMarkup(<NewsImage {...full} caption="" />);

    expect(output).not.toContain('figcaption');
  });

  // PL: Brak wymiarów nie psuje rysowania: atrybutów width i height nie ma.
  // EN: Missing dimensions do not break drawing: there are no width and height attributes.
  it('bez wymiarów rysuje zdjęcie bez atrybutów width i height / without dimensions draws the photo without width and height', () => {
    const output = renderToStaticMarkup(<NewsImage {...full} width={null} height={null} />);

    expect(output).toContain('<img src="/api/media/abc123" alt="Boisko" loading="lazy"/>');
    expect(output).not.toContain('width=');
    expect(output).not.toContain('height=');
  });
});
