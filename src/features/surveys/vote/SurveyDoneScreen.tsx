/**
 * PL: Ekran 4.4 „Ankieta wysłana” (docs/projekt/EKRANY.md): potwierdzenie po ostatnim pytaniu i powrót na pulpit. Nie pobiera danych.
 * EN: Screen 4.4 "Ankieta wysłana" (docs/projekt/EKRANY.md): the confirmation after the last question and the way back to the dashboard. Fetches no data.
 *
 * @author Jakub
 * @since 2026-10-09
 * @used_by src/features/surveys/vote/SurveysVoteScreen.tsx::SurveysVoteScreen
 */

// PL: Link bez przeładowania strony.
// EN: A link without reloading the page.
import { Link } from 'react-router';
import { CheckIcon } from './icons';

/**
 * PL: Rysuje potwierdzenie: kółko ze znacznikiem, „Odpowiedzi wysłane”, podziękowanie i przycisk „Wróć na pulpit”.
 * EN: Draws the confirmation: a circle with a check, "Odpowiedzi wysłane", a thank-you and the "Wróć na pulpit" button.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveyDoneScreen() {
  return (
    <main className="vote vote--flow vote--center" data-subtrack="5a">
      <div className="vote-done">
        <div className="vote-done__badge">
          <CheckIcon />
        </div>
        <h1>Odpowiedzi wysłane</h1>
        <p className="vote-lead">Wyniki widzi Samorząd Uczniowski. Dziękujemy za głos.</p>
      </div>
      <div className="vote-footer">
        <Link className="vote-button vote-button--primary" to="/">
          Wróć na pulpit
        </Link>
      </div>
    </main>
  );
}
