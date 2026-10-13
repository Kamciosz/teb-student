/**
 * PL: Teksty skali 1–5 na ekranie głosowania, których docs/projekt/EKRANY.md nie zawiera. Czekają na decyzję zespołu (lista w opisie pull requesta).
 * EN: The texts of the 1–5 scale on the voting screen that docs/projekt/EKRANY.md does not contain. They wait for a team decision (the list is in the pull request description).
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/surveys/vote/ScaleOptions.tsx::TO_AGREE
 */

/**
 * PL: Opisy skrajnych wartości skali. Do uzgodnienia z zespołem.
 * EN: The captions of the extreme scale values. To be agreed with the team.
 */
export const TO_AGREE = {
  /** PL: Opis pod wartością „1”. EN: The caption under the value "1". */
  scaleLowest: 'wcale',
  /** PL: Opis pod wartością „5”. EN: The caption under the value "5". */
  scaleHighest: 'bardzo',
} as const;
