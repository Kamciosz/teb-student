/**
 * PL: Test zamiany wyników na CSV: escapowanie pól (przecinek, cudzysłów, nowa linia), nagłówek, wiersz na każdą odpowiedź, BOM i CRLF.
 * EN: Test of turning the results into CSV: field escaping (comma, quote, new line), the header, a row for every option, the BOM and CRLF.
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
    const questions: QuestionResult[] = [{ prompt: '+Pytanie', options: [{ label: '-Odpowiedź', votes: 4, percent: 80 }, { label: '=HYPERLINK("x")', votes: 1, percent: 20 }] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}Pytanie,Odpowiedź,Liczba głosów,Procent\r\n'+Pytanie,'-Odpowiedź,4,80\r\n'+Pytanie,"'=HYPERLINK(""x"")",1,20\r\n`);
  });

  it('daje nagłówek, wiersz na każdą odpowiedź, BOM na początku i CRLF na końcu wierszy / gives the header, a row for every option, the BOM at the start and CRLF at the end of rows', () => {
    const questions: QuestionResult[] = [
      { prompt: 'Jak oceniasz obiady?', options: [{ label: 'Dobrze', votes: 5, percent: 42 }, { label: 'Słabo', votes: 2, percent: 17 }] },
      { prompt: 'Co poprawić?', options: [{ label: 'Porcje', votes: 7, percent: 58 }] },
    ];

    expect(toResultsCsv(questions)).toBe(`${BOM}Pytanie,Odpowiedź,Liczba głosów,Procent\r\nJak oceniasz obiady?,Dobrze,5,42\r\nJak oceniasz obiady?,Słabo,2,17\r\nCo poprawić?,Porcje,7,58\r\n`);
  });

  it('pytanie i odpowiedź z przecinkiem, cudzysłowem i nową linią nie psują kolumn / a question and an option with a comma, a quote and a new line do not break the columns', () => {
    const questions: QuestionResult[] = [{ prompt: 'Co, "naprawdę"?\nTak', options: [{ label: 'A, B', votes: 3, percent: 60 }, { label: 'C "x"', votes: 2, percent: 40 }] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}Pytanie,Odpowiedź,Liczba głosów,Procent\r\n"Co, ""naprawdę""?\nTak","A, B",3,60\r\n"Co, ""naprawdę""?\nTak","C ""x""",2,40\r\n`);
  });

  it('bez pytań zostaje sam nagłówek / with no questions only the header stays', () => {
    expect(toResultsCsv([])).toBe(`${BOM}Pytanie,Odpowiedź,Liczba głosów,Procent\r\n`);
  });

  it('odpowiedź bez głosów ma 0 głosów i 0 procent / an option without votes has 0 votes and 0 percent', () => {
    const questions: QuestionResult[] = [{ prompt: 'P', options: [{ label: 'A', votes: 0, percent: 0 }] }];

    expect(toResultsCsv(questions)).toBe(`${BOM}Pytanie,Odpowiedź,Liczba głosów,Procent\r\nP,A,0,0\r\n`);
  });
});
