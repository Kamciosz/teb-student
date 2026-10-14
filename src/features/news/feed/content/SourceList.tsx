/**
 * PL: Sekcja „Źródła” na końcu wpisu: nagłówek i lista linków. Każdy link pokazuje domenę, a pod nią adres, bo treść wpisu zapisuje tylko adresy, bez tytułu źródła. Linki otwierają się w nowej karcie.
 * EN: The "Źródła" (sources) section at the end of an entry: a heading and a list of links. Each link shows the domain, and the address under it, because the entry content stores only addresses, without a source title. The links open in a new tab.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/feed/content/sanitize.ts::SafeSource
 * @used_by src/features/news/feed/content/RichContent.tsx::renderBlock
 * @used_by src/features/news/feed/content/SourceList.test.tsx::SourceList
 */

// PL: Typ bezpiecznego adresu źródła.
// EN: The type of a safe source address.
import type { SafeSource } from './sanitize';

/**
 * PL: Dane listy źródeł.
 * EN: Source list data.
 */
export type SourceListProps = {
  /** PL: Bezpieczne adresy źródeł (po sprawdzeniu w sanitize.ts). EN: The safe source addresses (checked in sanitize.ts). */
  links: SafeSource[];
};

/**
 * PL: Rysuje sekcję „Źródła” z listą linków.
 * EN: Draws the "Źródła" section with a list of links.
 *
 * @param props - PL: lista źródeł. EN: the source list.
 * @returns PL: sekcja z nagłówkiem i listą. EN: the section with a heading and a list.
 */
export function SourceList({ links }: SourceListProps) {
  return (
    <section className="news-sources">
      {/* PL: Nagłówek sekcji. EN: The section heading. */}
      <h2>Źródła</h2>
      <ul>
        {links.map((link, index) => (
          // PL: Link otwiera się w nowej karcie, bez przekazywania strony, która otwiera.
          // EN: The link opens in a new tab, without passing the page that opened it.
          <li key={index}>
            <a href={link.href} target="_blank" rel="noopener noreferrer">
              <span className="news-sources__domain">{link.domain}</span>
              <span className="news-sources__address">{link.address}</span>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
