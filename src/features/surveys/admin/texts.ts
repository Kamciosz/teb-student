/**
 * PL: Teksty wyboru typu pytania i wyników wielokrotnego wyboru w panelu ankiet (podtor 5b). EKRANY.md (ekran 6.5b i 6.5d) nie podaje tych tekstów, więc są w grupie „TEXTS”.
 * EN: The texts of the question type choice and of the multiple choice results in the survey panel (subtrack 5b). EKRANY.md (screens 6.5b and 6.5d) does not give these texts, so they are in the "TEXTS" group.
 *
 * @author Szymon
 * @since 2026-10-13
 * @used_by src/features/surveys/admin/QuestionEditor.tsx::TEXTS
 * @used_by src/features/surveys/admin/ResultsScreen.tsx::TEXTS
 */

/**
 * PL: Teksty spoza EKRANY.md.
 * EN: The texts outside EKRANY.md.
 */
export const TEXTS = {
  questionType: {
    legend: 'Rodzaj pytania',
    single: 'Jeden wybór',
    multiple: 'Wiele wyborów',
    scale: 'Skala 1–5',
    shortText: 'Krótka odpowiedź',
  },
  /** PL: Dopisek nad listą krótkich odpowiedzi w wynikach. EN: The note above the list of short answers in the results. */
  textsNote: 'Odpowiedzi są w kolejności alfabetycznej. Nie widać, kto je napisał.',
  /** PL: Dopisek w wynikach wielokrotnego wyboru. EN: The note in the multiple choice results. */
  multipleNote: 'Uczeń mógł zaznaczyć kilka odpowiedzi.',
  /** PL: Liczba zaznaczeń w wynikach wielokrotnego wyboru. EN: The number of checked boxes in the multiple choice results. */
  checkedCount: (count: number) => `Zaznaczeń: ${count}`,
  /** PL: Średnia w wynikach skali 1–5, z przecinkiem dziesiętnym. EN: The average in the 1–5 scale results, with a decimal comma. */
  average: (value: number) => `Średnia: ${value.toFixed(1).replace('.', ',')}`,
} as const;
