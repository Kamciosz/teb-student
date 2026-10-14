/**
 * PL: Test pytania krótkiej odpowiedzi: stała podpowiedź o anonimowości stoi pod polem i jest połączona z nim przez aria-describedby, obok licznika znaków. Testy rysują do tekstu (react-dom/server), bo działają w Workerze bez przeglądarki.
 * EN: Test of the short-answer question: the fixed anonymity hint sits under the field and is tied to it through aria-describedby, next to the character counter. The tests render to a string (react-dom/server), because they run in a Worker without a browser.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses src/features/surveys/vote/QuestionStep.tsx::QuestionStep
 * @uses src/features/surveys/vote/texts.ts::TEXTS
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Rysowanie komponentu do tekstu HTML.
// EN: Rendering a component to an HTML string.
import { renderToString } from 'react-dom/server';
// PL: Komponent pod testem i jego tekst.
// EN: The component under test and its text.
import { QuestionStep } from './QuestionStep';
import { TEXTS } from './texts';
import type { SurveyQuestion } from './types';

// PL: Pytanie krótkiej odpowiedzi bez wyborów.
// EN: A short-answer question with no options.
const SHORT_QUESTION: SurveyQuestion = { id: 'k1', type: 'short_text', prompt: 'Co zmienić?', options: [] };

// PL: Rysuje pytanie z podanym tekstem i zwraca HTML.
// EN: Renders the question with the given text and returns the HTML.
function render(text: string): string {
  return renderToString(<QuestionStep question={SHORT_QUESTION} number={1} selectedIds={[]} onChange={() => {}} text={text} onTextChange={() => {}} />);
}

describe('podpowiedź o anonimowości pod krótką odpowiedzią / the anonymity hint under the short answer', () => {
  it('stoi pod polem, a nie nad nim / sits under the field, not above it', () => {
    const html = render('');
    const textareaEnd = html.indexOf('</textarea>');

    expect(textareaEnd).toBeGreaterThan(-1);
    expect(html.indexOf(TEXTS.shortTextHint)).toBeGreaterThan(textareaEnd);
  });

  it('jest widoczna od razu, także przy pustym polu / is shown at once, also for an empty field', () => {
    expect(render('')).toContain(TEXTS.shortTextHint);
  });

  it('pole ma opis z podpowiedzią i z licznikiem / the field has a description with the hint and the counter', () => {
    const html = render('');
    const textarea = html.match(/<textarea[^>]*>/)?.[0] ?? '';
    const describedBy = textarea.match(/aria-describedby="([^"]+)"/)?.[1] ?? '';
    const hintId = html.match(/<p id="([^"]+)"[^>]*>Nie wpisuj/)?.[1] ?? '';
    const counterId = html.match(/<span id="([^"]+)" class="vote-counter"/)?.[1] ?? '';

    expect(hintId).toBeTruthy();
    expect(counterId).toBeTruthy();
    expect(describedBy.split(' ')).toEqual([hintId, counterId]);
  });
});
