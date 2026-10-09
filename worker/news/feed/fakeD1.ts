/**
 * PL: Atrapa bazy D1 do testów podtoru 3a. Zapisuje każde zapytanie (tekst SQL i parametry) i oddaje z góry ustawione wiersze. To nie jest prawdziwa baza: testy sprawdzają, jakie zapytanie serwer wysłał, a nie jakie wiersze baza by zwróciła. Prawdziwy D1 w testach czeka na zgłoszenie #43 (wiązanie DB w wrangler.jsonc).
 * EN: A D1 database fake for the tests of subtrack 3a. It records every query (the SQL text and the parameters) and returns preset rows. It is not a real database: the tests check which query the server sent, not which rows a database would return. A real D1 in tests waits for issue #43 (the DB binding in wrangler.jsonc).
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by worker/news/feed/queries.test.ts::createFakeD1
 * @used_by worker/news/feed/routes.test.ts::createFakeD1
 */

/**
 * PL: Jedno zapytanie, które dotarło do atrapy.
 * EN: One query that reached the fake.
 */
export type RecordedQuery = {
  /** PL: Tekst SQL z znakami ? w miejscu parametrów. EN: The SQL text with ? characters in place of parameters. */
  sql: string;
  /** PL: Wartości parametrów w kolejności znaków ?. EN: The parameter values in the order of the ? characters. */
  params: unknown[];
};

/**
 * PL: Atrapa bazy razem z listą zapytań, które do niej trafiły.
 * EN: The fake database together with the list of queries that reached it.
 */
export type FakeD1 = {
  /** PL: Obiekt do podania jako wiązanie DB. EN: The object to pass as the DB binding. */
  binding: D1Database;
  /** PL: Zapytania w kolejności wysłania. EN: The queries in the order they were sent. */
  queries: RecordedQuery[];
};

/**
 * PL: Tworzy atrapę D1.
 * EN: Creates a D1 fake.
 *
 * @param rows - PL: wiersze w trybie tablicowym (kolejność kolumn jak w tabeli), które oddaje każde zapytanie odczytu. EN: rows in array mode (column order as in the table) that every read query returns.
 * @param failure - PL: błąd, który atrapa rzuca zamiast oddawać wiersze. EN: an error the fake throws instead of returning rows.
 * @returns PL: atrapa i lista zapytań. EN: the fake and the list of queries.
 */
export function createFakeD1(rows: unknown[][] = [], failure?: Error): FakeD1 {
  // PL: Lista, do której trafia każde zapytanie.
  // EN: The list that receives every query.
  const queries: RecordedQuery[] = [];

  // PL: Atrapa udaje tylko to, czego używa Drizzle przy odczycie: prepare, bind i raw.
  // EN: The fake imitates only what Drizzle uses for reading: prepare, bind and raw.
  const binding = {
    prepare(sql: string) {
      const statement = {
        bind(...params: unknown[]) {
          queries.push({ sql, params });
          return statement;
        },
        async raw() {
          if (failure) throw failure;
          return rows;
        },
      };
      return statement;
    },
  } as unknown as D1Database;

  return { binding, queries };
}
