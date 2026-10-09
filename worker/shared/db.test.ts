/**
 * PL: Test bazy D1 w testach Vitest: sprawdza, że env.DB działa (zapis i odczyt wiersza) i że każda tabela ze schematu Drizzle istnieje w bazie testowej. Gdyby binding DB albo plik worker/shared/testSetup.ts zniknęły, test padnie.
 * EN: Test of the D1 database in Vitest tests: checks that env.DB works (writing and reading a row) and that every table of the Drizzle schema exists in the test database. If the DB binding or the worker/shared/testSetup.ts file went missing, the test would fail.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/db/schema/index.ts::*
 * @uses worker/shared/testSetup.ts::*
 * @used_by vitest.config.ts::include
 */

// PL: Rozpoznawanie tabel Drizzle wśród eksportów i ich nazwy w SQL.
// EN: Recognising Drizzle tables among the exports and their SQL names.
import { getTableName, is } from 'drizzle-orm';
// PL: Typ tabeli SQLite.
// EN: The SQLite table type.
import { SQLiteTable } from 'drizzle-orm/sqlite-core';
// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Baza testowa.
// EN: The test database.
import { env } from 'cloudflare:workers';
// PL: Wszystkie eksporty schematu: tabele i ewentualnie inne rzeczy.
// EN: All exports of the schema: tables and possibly other things.
import * as schema from '../db/schema';

// PL: Grupa testów bazy D1.
// EN: A group of tests for the D1 database.
describe('baza D1 w testach / D1 database in tests', () => {
  // PL: Zapis i odczyt: dowód, że binding DB istnieje i działa.
  // EN: Write and read: proof that the DB binding exists and works.
  it('zapisuje i odczytuje wiersz / writes and reads a row', async () => {
    // PL: Załóż tabelę tylko na ten test. Nie jest w schemacie, bo to próba samej bazy.
    // EN: Create a table for this test only. It is not in the schema, because this probes the database itself.
    await env.DB.exec('CREATE TABLE db_test_probe (id TEXT PRIMARY KEY NOT NULL, label TEXT NOT NULL)');
    // PL: Wpisz wiersz i przeczytaj go z powrotem.
    // EN: Insert a row and read it back.
    await env.DB.prepare('INSERT INTO db_test_probe (id, label) VALUES (?, ?)').bind('1', 'zapisane').run();
    const row = await env.DB.prepare('SELECT label FROM db_test_probe WHERE id = ?').bind('1').first<{ label: string }>();

    // PL: Odczytany wiersz ma to, co zapisano.
    // EN: The row read has what was written.
    expect(row?.label).toBe('zapisane');

    // PL: Sprzątanie: usuń tabelę próbną.
    // EN: Cleanup: drop the probe table.
    await env.DB.exec('DROP TABLE db_test_probe');
  });

  // PL: Każda tabela ze schematu ma być w bazie testowej. Dziś schemat jest pusty, więc test przechodzi trywialnie, a od pierwszej tabeli pilnuje setupu.
  // EN: Every schema table must be in the test database. Today the schema is empty, so the test passes trivially, and from the first table on it guards the setup.
  it('ma wszystkie tabele ze schematu / has every table of the schema', async () => {
    // PL: Nazwy tabel zebrane z eksportów schematu.
    // EN: The table names collected from the schema exports.
    const expected = Object.values(schema)
      .filter((value) => is(value, SQLiteTable))
      .map((table) => getTableName(table as SQLiteTable))
      .sort();
    // PL: Nazwy tabel, które baza naprawdę ma (bez tabel wewnętrznych SQLite, D1 i Cloudflare).
    // EN: The table names the database really has (without internal SQLite, D1 and Cloudflare tables).
    const { results } = await env.DB.prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' AND name NOT LIKE '_cf_%' AND name <> 'd1_migrations' ORDER BY name").all<{ name: string }>();

    // PL: Baza ma dokładnie te tabele, które opisuje schemat.
    // EN: The database has exactly the tables the schema describes.
    expect(results.map((row) => row.name)).toEqual(expected);
  });
});
