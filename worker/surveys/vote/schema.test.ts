/**
 * PL: Test schematu bazy ankiet. Pilnuje dwóch zasad: uczeń głosuje raz (klucz główny „kto głosował”) i anonimowość (tabele z wynikiem nie mają numeru ucznia ani czasu, a tabela „kto głosował” nie ma odpowiedzi).
 *     Test oblewa, gdy ktoś usunie klucz albo doda do licznika kolumnę z uczniem lub czasem.
 * EN: Test of the survey database schema. It guards two rules: a student votes once (the primary key of "who voted") and anonymity (the tables with the result have no student id or time, and the "who voted" table has no answers).
 *     The test fails when someone removes the key or adds a student or time column to the counter.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses worker/db/schema/surveys.ts::surveyParticipation
 * @used_by vitest.config.ts::include
 */

// PL: Odczyt opisu tabeli Drizzle: kolumny i klucze.
// EN: Reading a Drizzle table description: columns and keys.
import { getTableConfig } from 'drizzle-orm/sqlite-core';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Tabele, które sprawdzamy.
// EN: The tables under test.
import { surveyOptions, surveyParticipation, surveyQuestions } from '../../db/schema/surveys';

/**
 * PL: Nazwy kolumn z nazwą kolumny po przecinku.
 * EN: Column names from a table description.
 *
 * @param table - PL: tabela Drizzle. EN: a Drizzle table.
 * @returns PL: nazwy kolumn w SQL. EN: the SQL column names.
 */
function columnNames(table: Parameters<typeof getTableConfig>[0]): string[] {
  // PL: Weź nazwy kolumn z opisu tabeli.
  // EN: Take the column names from the table description.
  return getTableConfig(table).columns.map((column) => column.name);
}

// PL: Wzorzec nazw, które mogłyby połączyć wynik z uczniem albo z chwilą głosu.
// EN: A pattern of names that could link a result to a student or to the moment of a vote.
const IDENTIFYING_COLUMN = /user|student|owner|author|time|date|created|updated|_at$/;

// PL: Grupa testów schematu.
// EN: A group of tests for the schema.
describe('schemat ankiet / survey schema', () => {
  it('jeden głos na ucznia: klucz główny to (ankieta, uczeń) / one vote per student: the primary key is (survey, student)', () => {
    const [primaryKey] = getTableConfig(surveyParticipation).primaryKeys;

    expect(primaryKey?.columns.map((column) => column.name)).toEqual(['survey_id', 'user_id']);
  });

  it('wynik to same liczniki: odpowiedzi i pytania nie mają ucznia ani czasu / the result is only counters: options and questions have no student or time', () => {
    const names = [...columnNames(surveyOptions), ...columnNames(surveyQuestions)];

    expect(names.filter((name) => IDENTIFYING_COLUMN.test(name))).toEqual([]);
  });

  it('„kto głosował” nie ma odpowiedzi ani czasu / "who voted" has no answers and no time', () => {
    expect(columnNames(surveyParticipation).sort()).toEqual(['survey_id', 'user_id']);
  });
});
