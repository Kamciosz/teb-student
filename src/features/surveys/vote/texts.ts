/**
 * PL: Teksty skali 1–5 i krótkiej odpowiedzi na ekranie głosowania, których docs/projekt/EKRANY.md nie zawiera. Czekają na decyzję zespołu (lista w opisie pull requesta).
 * EN: The texts of the 1–5 scale and of the short answer on the voting screen that docs/projekt/EKRANY.md does not contain. They wait for a team decision (the list is in the pull request description).
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/surveys/vote/ScaleOptions.tsx::TO_AGREE
 * @used_by src/features/surveys/vote/QuestionStep.tsx::TO_AGREE
 */

/**
 * PL: Opisy skali 1–5 i pola krótkiej odpowiedzi. Do uzgodnienia z zespołem.
 * EN: The captions of the 1–5 scale and of the short-answer field. To be agreed with the team.
 */
export const TO_AGREE = {
  /** PL: Opis pod wartością „1”. EN: The caption under the value "1". */
  scaleLowest: 'wcale',
  /** PL: Opis pod wartością „5”. EN: The caption under the value "5". */
  scaleHighest: 'bardzo',
  /** PL: Nazwa pola krótkiej odpowiedzi dla czytnika ekranu (w widoku niewidoczna). EN: The name of the short-answer field for a screen reader (hidden on screen). */
  shortTextLabel: 'Twoja odpowiedź',
  /** PL: Podpowiedź pod polem krótkiej odpowiedzi o anonimowości, zawsze widoczna. EN: The anonymity hint under the short-answer field, always shown. */
  shortTextHint: 'Nie wpisuj imienia ani klasy. Odpowiedź jest anonimowa.',
  /** PL: Podpowiedź, gdy tekst jest za długi i nie da się wysłać. EN: The hint shown when the text is too long to send. */
  shortTextTooLong: 'Za dużo znaków. Skróć odpowiedź.',
} as const;
