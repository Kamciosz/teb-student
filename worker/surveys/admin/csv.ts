/**
 * PL: Zamiana wyników ankiety na plik CSV dla Excela: pytanie, odpowiedź, liczba głosów, procent. Pole bierzemy w cudzysłów, gdy ma przecinek, cudzysłów albo nową linię (cudzysłów w środku podwajamy). Na początku BOM UTF-8, żeby Excel odczytał polskie znaki. Plik nie zawiera danych osobowych: są tylko treści pytań i liczniki.
 * EN: Turning survey results into a CSV file for Excel: question, option, vote count, percent. A field goes in quotes when it has a comma, a quote or a new line (inside, the quotes are doubled). The UTF-8 BOM at the start lets Excel read the Polish letters. The file has no personal data: only the question texts and the counters.
 *
 * @author Jakub
 * @since 2026-10-13
 * @uses worker/surveys/admin/types.ts::QuestionResult
 * @used_by worker/surveys/admin/routes.ts::surveysAdminApp
 * @used_by worker/surveys/admin/csv.test.ts::escapeCsvField
 */

import type { QuestionResult } from './types';

// PL: Znak kolejności bajtów UTF-8 na początku pliku. Bez niego Excel czyta polskie litery jako krzaki.
// EN: The UTF-8 byte order mark at the start of the file. Without it Excel reads the Polish letters as garbage.
const BOM = '﻿';

// PL: Nagłówek kolumn pliku.
// EN: The column header of the file.
const HEADER = ['Pytanie', 'Odpowiedź', 'Liczba głosów', 'Procent'];

/**
 * PL: Escapuje jedno pole CSV. Pole z przecinkiem, cudzysłowem albo nową linią bierzemy w cudzysłów, a wewnętrzne cudzysłowy podwajamy.
 * EN: Escapes one CSV field. A field with a comma, a quote or a new line goes in quotes, and the inner quotes are doubled.
 *
 * @param value - PL: surowa wartość pola. EN: the raw field value.
 * @returns PL: pole gotowe do wstawienia w wiersz. EN: the field ready to put in a row.
 */
export function escapeCsvField(value: string): string {
  // PL: Zwykłe pole zostaje bez zmian.
  // EN: A plain field stays as it is.
  if (!/[",\r\n]/.test(value)) return value;
  return `"${value.replace(/"/g, '""')}"`;
}

/**
 * PL: Składa cały plik CSV z wynikami: nagłówek, potem jeden wiersz na każdą odpowiedź każdego pytania. Wiersze kończą się CRLF, tak jak Excel zapisuje CSV.
 * EN: Builds the whole CSV file with the results: the header, then one row for every option of every question. The rows end with CRLF, the way Excel writes CSV.
 *
 * @param questions - PL: pytania z odpowiedziami i udziałami. EN: the questions with options and shares.
 * @returns PL: treść pliku z BOM-em na początku. EN: the file content with the BOM at the start.
 */
export function toResultsCsv(questions: QuestionResult[]): string {
  // PL: Każdy wiersz to pytanie, odpowiedź, liczba głosów i procent; liczby zamieniamy na tekst.
  // EN: Each row is the question, the option, the vote count and the percent; the numbers become text.
  const rows = questions.flatMap((question) => question.options.map((option) => [question.prompt, option.label, String(option.votes), String(option.percent)]));
  const lines = [HEADER, ...rows].map((row) => row.map(escapeCsvField).join(','));
  return `${BOM}${lines.join('\r\n')}\r\n`;
}
