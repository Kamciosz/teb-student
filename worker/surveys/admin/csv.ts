/**
 * PL: Zamiana wyników ankiety na plik CSV dla Excela: pytanie, odpowiedź, liczba głosów, procent i średnia ze skali. Pytanie skali ma dodatkowy wiersz „Średnia”. Krótka odpowiedź to jeden wiersz na każdy tekst, bez danych autora. Pole bierzemy w cudzysłów, gdy ma przecinek, cudzysłów albo nową linię (cudzysłów w środku podwajamy). Teksty zaczynające się od znaku formuły dostają apostrof. Na początku BOM UTF-8, żeby Excel odczytał polskie znaki. Plik zawiera treści pytań, liczniki i wolne odpowiedzi, ale nie zawiera danych autorów odpowiedzi.
 * EN: Turning survey results into a CSV file for Excel: question, option, vote count, percent and the 1–5 scale average. A scale question has an extra "Średnia" (average) row. A short answer is one row per text, with no author data. A field goes in quotes when it has a comma, a quote or a new line (inside, the quotes are doubled). A text starting with a formula character gets an apostrophe. The UTF-8 BOM at the start lets Excel read the Polish letters. The file has the question texts, the counters and the free-text answers, but no data about who wrote the answers.
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

// PL: Nagłówek kolumn pliku. Piąta kolumna jest tylko dla średniej ze skali; w pozostałych wierszach jest pusta.
// EN: The column header of the file. The fifth column is only for the scale average; in the other rows it is empty.
const HEADER = ['Pytanie', 'Odpowiedź', 'Liczba głosów', 'Procent', 'Średnia'];

// PL: Etykieta wiersza ze średnią skali (do uzgodnienia z zespołem).
// EN: The label of the scale average row (to be agreed with the team).
const AVERAGE_LABEL = 'Średnia';

// PL: Znaki, od których Excel potraktuje pole jak formułę (OWASP CSV injection): znak równości, plus, minus, małpa, tabulator i powrót karetki.
// EN: The characters that make Excel treat a field as a formula (OWASP CSV injection): the equals sign, plus, minus, at sign, tab and carriage return.
const FORMULA_START = /^[=+\-@\t\r]/;

/**
 * PL: Neutralizuje tekst, który zaczyna się od znaku formuły: przed nim dopisuje apostrof, żeby Excel pokazał go jako tekst. Stosujemy tylko do tekstów pytań i odpowiedzi, nie do liczb.
 * EN: Neutralizes a text that starts with a formula character: prefixes it with an apostrophe so Excel shows it as text. Applied only to the texts of questions and options, not to numbers.
 *
 * @param value - PL: surowa wartość tekstowa. EN: the raw text value.
 * @returns PL: tekst z apostrofem, jeśli zaczyna się od znaku formuły. EN: the text with an apostrophe, if it starts with a formula character.
 */
export function neutralizeFormula(value: string): string {
  return FORMULA_START.test(value) ? `'${value}` : value;
}

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
 * PL: Zamienia średnią na tekst z przecinkiem dziesiętnym, tak jak na ekranie wyników (np. 4,0). Brak średniej to puste pole.
 * EN: Turns the average into text with a decimal comma, as on the results screen (e.g. 4,0). No average means an empty field.
 *
 * @param average - PL: średnia albo undefined, gdy nikt nie głosował. EN: the average, or undefined when nobody voted.
 * @returns PL: tekst do komórki. EN: the text for the cell.
 */
function formatAverage(average: number | undefined): string {
  return average === undefined ? '' : average.toFixed(1).replace('.', ',');
}

/**
 * PL: Zamienia jedno pytanie na wiersze CSV: krótka odpowiedź daje wiersz na każdy tekst (w kolejności z serwera, czyli alfabetycznej), wybór daje wiersz na odpowiedź, a skala dodatkowo wiersz średniej.
 * EN: Turns one question into CSV rows: a short answer gives a row for every text (in the server order, the alphabetical one), a choice question gives a row for every option, and the scale also gets an average row.
 *
 * @param question - PL: pytanie z wynikami. EN: the question with its results.
 * @returns PL: wiersze pól (jeszcze bez escapowania). EN: the rows of fields (not escaped yet).
 */
function questionRows(question: QuestionResult): string[][] {
  const prompt = neutralizeFormula(question.prompt);
  // PL: Tekst krótkiej odpowiedzi idzie do kolumny „Odpowiedź”, a liczby zostają puste.
  // EN: The short answer text goes to the "Odpowiedź" column, and the numbers stay empty.
  if (question.type === 'short_text') return (question.texts ?? []).map((text) => [prompt, neutralizeFormula(text), '', '', '']);
  const rows = question.options.map((option) => [prompt, neutralizeFormula(option.label), String(option.votes), String(option.percent), '']);
  // PL: Średnia ma własny wiersz, a nie kolumnę „Liczba głosów”, bo nie jest liczbą osób.
  // EN: The average has its own row, not the "Liczba głosów" column, because it is not a count of people.
  if (question.type !== 'scale_1_5') return rows;
  return [...rows, [prompt, AVERAGE_LABEL, '', '', formatAverage(question.average)]];
}

/**
 * PL: Składa cały plik CSV z wynikami: nagłówek, potem wiersze wszystkich pytań. Wiersze kończą się CRLF, tak jak Excel zapisuje CSV.
 * EN: Builds the whole CSV file with the results: the header, then the rows of all the questions. The rows end with CRLF, the way Excel writes CSV.
 *
 * @param questions - PL: pytania z wynikami (przy krótkiej odpowiedzi z tekstami). EN: the questions with the results (for a short answer with the texts).
 * @returns PL: treść pliku z BOM-em na początku. EN: the file content with the BOM at the start.
 */
export function toResultsCsv(questions: QuestionResult[]): string {
  const rows = questions.flatMap(questionRows);
  const lines = [HEADER, ...rows].map((row) => row.map(escapeCsvField).join(','));
  return `${BOM}${lines.join('\r\n')}\r\n`;
}
