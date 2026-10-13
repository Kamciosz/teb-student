/**
 * PL: Test zamiany wyników na CSV: escapowanie pól (przecinek, cudzysłów, nowa linia), nagłówek, wiersz na każdą odpowiedź, średnia skali, krótka odpowiedź (wiersz na tekst), neutralizacja formuł, BOM i CRLF.
 * EN: Test of turning the results into CSV: field escaping (comma, quote, new line), the header, a row for every option, the scale average, the short answer (a row per text), formula neutralization, the BOM and CRLF.
 *
 * @author Jakub
 * @since 2026-10-13
 * @uses worker/surveys/admin/csv.ts::escapeCsvField
 * @uses worker/surveys/admin/csv.ts::toResultsCsv
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { escapeCsvField, neutralizeFormula, toResultsCsv } from './csv';
import type { QuestionResult } from './types';

// PL: Znak kolejności bajtów UTF-8, który ma być na początku pliku.
// EN: The UTF-8 byte order mark that must be at the start of the file.
const BOM = '﻿';

// PL: Nagłówek pliku z kolumną średniej.
// EN: The file header with the average column.
const HEADER_LINE = 'Pytanie,Odpowiedź,Liczba głosów,Procent,Średnia\r\n';

describe('escapeCsvField', () => {
  it.each(['Odpowiedź', 'zwykły tekst', 'Piłka nożna', ''])('zwykłe pole %j zostaje bez zmian / a plain field %j stays as it is', (value) => {
    expect(escapeCsvField(value)).toBe(value);
  });

  it('pole z przecinkiem idzie w cudzysłów / a field with a comma goes in quotes', () => {
    expect(escapeCsvField('A, B')).toBe('"A, B"');
  });

  it('cudzysłów w środku jest podwajany i całe pole idzie w cudzysłów / a quote inside is doubled and the whole field goes in quotes', () => {
    expect(escapeCsvField('C "x"')).toBe('"C ""x"""');
  });

  it('nowa linia, LF albo CRLF, idzie w cudzysłów / a new line, LF or CRLF, goes in quotes', () => {
    expect(escapeCsvField('linia 1\nlinia 2')).toBe('"linia 1\nlinia 2"');
    expect(escapeCsvField('linia 1\r\nlinia 2')).toBe('"linia 1\r\nlinia 2"');
  });

  it('polskie litery nie wymagają cudzysłowu / Polish letters do not need quotes', () => {
    expect(escapeCsvField('zażółć gęślą jaźń')).toBe('zażółć gęślą jaźń');
  });
});

describe('neutralizeFormula', () => {
  it.each(['=', '+', '-', '@', '\t', '\r'])('pole zaczynające się od znaku %j dostaje apostrof / a field starting with the character %j gets an apostrophe', (character) => {
    expect(neutralizeFormula(`${character}1+1`)).toBe(`'${character}1+1`);
  });

  it('zwykły tekst i znak formuły w środku zostają bez zmian / plain text and a formula character inside stay as they are', () => {
    expect(neutralizeFormula('Odpowiedź')).toBe('Odpowiedź');
    expect(neutralizeFormula('A=B, C-D')).toBe('A=B, C-D');
    expect(neutralizeFormula('')).toBe('');
  });
});

describe('toResultsCsv', () => {
  it('neutralizuje teksty zaczynające się od znaku formuły, a liczby zostawia / neutralizes texts starting with a formula character and leaves the numbers', () => {
    const questions: QuestionResult[] = [{ prompt: '+Pytanie', type: 'single_choice', options: [{ label: '-Odpowiedź', votes: 4, percent: 80 }, { label: '=HYPERLINK("x")', votes: 1, percent: 20 }] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}'+Pytanie,'-Odpowiedź,4,80,\r\n'+Pytanie,"'=HYPERLINK(""x"")",1,20,\r\n`);
  });

  it('daje nagłówek, wiersz na każdą odpowiedź, BOM na początku i CRLF na końcu wierszy / gives the header, a row for every option, the BOM at the start and CRLF at the end of rows', () => {
    const questions: QuestionResult[] = [
      { prompt: 'Jak oceniasz obiady?', type: 'single_choice', options: [{ label: 'Dobrze', votes: 5, percent: 42 }, { label: 'Słabo', votes: 2, percent: 17 }] },
      { prompt: 'Co poprawić?', type: 'single_choice', options: [{ label: 'Porcje', votes: 7, percent: 58 }] },
    ];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}Jak oceniasz obiady?,Dobrze,5,42,\r\nJak oceniasz obiady?,Słabo,2,17,\r\nCo poprawić?,Porcje,7,58,\r\n`);
  });

  it('pytanie i odpowiedź z przecinkiem, cudzysłowem i nową linią nie psują kolumn / a question and an option with a comma, a quote and a new line do not break the columns', () => {
    const questions: QuestionResult[] = [{ prompt: 'Co, "naprawdę"?\nTak', type: 'single_choice', options: [{ label: 'A, B', votes: 3, percent: 60 }, { label: 'C "x"', votes: 2, percent: 40 }] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}"Co, ""naprawdę""?\nTak","A, B",3,60,\r\n"Co, ""naprawdę""?\nTak","C ""x""",2,40,\r\n`);
  });

  it('bez pytań zostaje sam nagłówek / with no questions only the header stays', () => {
    expect(toResultsCsv([])).toBe(`${BOM}${HEADER_LINE}`);
  });

  it('odpowiedź bez głosów ma 0 głosów i 0 procent / an option without votes has 0 votes and 0 percent', () => {
    const questions: QuestionResult[] = [{ prompt: 'P', type: 'single_choice', options: [{ label: 'A', votes: 0, percent: 0 }] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}P,A,0,0,\r\n`);
  });

  it('skala daje wiersz na każdą wartość 1–5 i wiersz średniej z przecinkiem, także 5,0 / a scale gives a row for each value 1–5 and an average row with a decimal comma, also 5,0', () => {
    const questions: QuestionResult[] = [{ prompt: 'Jak oceniasz?', type: 'scale_1_5', options: [1, 2, 3, 4, 5].map((value, index) => ({ label: String(value), votes: index === 4 ? 2 : 0, percent: index === 4 ? 100 : 0 })), average: 5 }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}Jak oceniasz?,1,0,0,\r\nJak oceniasz?,2,0,0,\r\nJak oceniasz?,3,0,0,\r\nJak oceniasz?,4,0,0,\r\nJak oceniasz?,5,2,100,\r\nJak oceniasz?,Średnia,,,"5,0"\r\n`);
  });

  it('średnia skali z jednym miejscem po przecinku idzie w cudzysłów, bo ma przecinek / a scale average with one decimal goes in quotes, because it has a comma', () => {
    const questions: QuestionResult[] = [{ prompt: 'P', type: 'scale_1_5', options: [{ label: '4', votes: 2, percent: 100 }], average: 3.4 }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}P,4,2,100,\r\nP,Średnia,,,"3,4"\r\n`);
  });

  it('skala bez głosów ma pustą średnią / a scale without votes has an empty average', () => {
    const questions: QuestionResult[] = [{ prompt: 'P', type: 'scale_1_5', options: [{ label: '1', votes: 0, percent: 0 }] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}P,1,0,0,\r\nP,Średnia,,,\r\n`);
  });

  it('krótka odpowiedź daje wiersz na każdy tekst, w podanej kolejności, bez liczb / a short answer gives a row for every text, in the given order, with no numbers', () => {
    const questions: QuestionResult[] = [{ prompt: 'Co zmienić?', type: 'short_text', options: [], texts: ['Lody', 'Łyżwy', 'Zupa'] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}Co zmienić?,Lody,,,\r\nCo zmienić?,Łyżwy,,,\r\nCo zmienić?,Zupa,,,\r\n`);
  });

  it('tekst krótkiej odpowiedzi z przecinkiem, cudzysłowem, LF i CRLF jest escapowany / a short answer with a comma, a quote, LF and CRLF is escaped', () => {
    const questions: QuestionResult[] = [{ prompt: 'P', type: 'short_text', options: [], texts: ['Za drogo, "bardzo"\nproszę', 'linia\r\nkolejna'] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}P,"Za drogo, ""bardzo""\nproszę",,,\r\nP,"linia\r\nkolejna",,,\r\n`);
  });

  it('krótka odpowiedź zaczynająca się od znaku formuły dostaje apostrof / a short answer starting with a formula character gets an apostrophe', () => {
    const questions: QuestionResult[] = [{ prompt: 'P', type: 'short_text', options: [], texts: ['=1+1', '+12', '-3', '@SUM(A1)', 'Zwykły tekst'] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}P,'=1+1,,,\r\nP,'+12,,,\r\nP,'-3,,,\r\nP,'@SUM(A1),,,\r\nP,Zwykły tekst,,,\r\n`);
  });

  it('pytanie krótkiej odpowiedzi bez tekstów nie daje wierszy / a short-answer question without texts gives no rows', () => {
    const questions: QuestionResult[] = [{ prompt: 'P', type: 'short_text', options: [] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}${HEADER_LINE}`);
  });
});
