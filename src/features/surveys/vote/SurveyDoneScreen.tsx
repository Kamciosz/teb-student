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

/**
 * PL: Rysuje potwierdzenie: nagłówek „Odpowiedzi wysłane”, podziękowanie i jedną akcję tekstową „Wróć na pulpit”.
 * EN: Draws the confirmation: the "Odpowiedzi wysłane" heading, a thank-you and one text action "Wróć na pulpit".
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveyDoneScreen() {
  return (
    <main className="vote vote--flow vote--center" data-subtrack="5a">
      <div className="vote-done">
        <h1>Odpowiedzi wysłane</h1>
        <p className="vote-lead">Wyniki widzi Samorząd Uczniowski. Dziękujemy za głos.</p>
      </div>
      <div className="vote-footer">
        <Link className="ui-button ui-button--plain" to="/">
          Wróć na pulpit
        </Link>
      </div>
    </main>
  );
}
