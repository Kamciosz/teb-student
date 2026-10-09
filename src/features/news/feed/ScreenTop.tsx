/**
 * PL: Górny pasek ekranu aktualności: strzałka powrotu i nagłówek H1. Nagłówek dostaje fokus po wejściu na ekran, żeby czytnik ekranu zaczął od tytułu.
 * EN: The top bar of a news screen: a back arrow and the H1 heading. The heading gets focus on entering the screen, so a screen reader starts from the title.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by src/features/news/feed/FeedListScreen.tsx::ScreenTop
 * @used_by src/features/news/feed/EntryScreen.tsx::ScreenTop
 */

// PL: Fokus ustawiany z kodu po pierwszym narysowaniu.
// EN: Focus set from code after the first draw.
import { useEffect, useRef } from 'react';
// PL: Odnośnik routera.
// EN: The router link.
import { Link } from 'react-router';

/**
 * PL: Dane paska.
 * EN: Bar data.
 */
export type ScreenTopProps = {
  /** PL: Tytuł ekranu. EN: The screen title. */
  title: string;
  /** PL: Dokąd prowadzi strzałka. EN: Where the arrow leads. */
  backTo: string;
  /** PL: Opis strzałki dla czytnika ekranu. EN: The arrow description for a screen reader. */
  backLabel: string;
};

/**
 * PL: Rysuje pasek z powrotem i tytułem.
 * EN: Draws the bar with the back arrow and the title.
 *
 * @param props - PL: tytuł i cel powrotu. EN: the title and the back target.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function ScreenTop({ title, backTo, backLabel }: ScreenTopProps) {
  // PL: Odwołanie do nagłówka, któremu damy fokus.
  // EN: The reference to the heading that gets focus.
  const headingRef = useRef<HTMLHeadingElement>(null);

  // PL: Po wejściu na ekran ustaw fokus na nagłówku.
  // EN: After entering the screen, put focus on the heading.
  useEffect(() => {
    headingRef.current?.focus();
  }, []);

  return (
    <header className="news-top">
      <Link className="news-top__back" to={backTo} aria-label={backLabel}>
        <span aria-hidden="true">←</span>
      </Link>
      <h1 ref={headingRef} tabIndex={-1}>
        {title}
      </h1>
    </header>
  );
}
