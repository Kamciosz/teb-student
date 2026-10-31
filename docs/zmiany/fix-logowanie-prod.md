## Changelog

**Uwaga przed wdrożeniem: tabelę `rate_limit` trzeba utworzyć w bazie produkcyjnej przed wdrożeniem tej zmiany.** Bez niej logowanie odpowiada 500, bo Better Auth zapisuje liczniki limitu w tej tabeli. Sprawdź różnicę schematu poleceniem `node scripts/dbDiff.ts`. Tabela powinna się na niej pojawić jako brakująca.

### Naprawione

- Logowanie kodem i kontami z hasłem wymaga adresu aplikacji z `BETTER_AUTH_URL` także poza dev. Bez niego serwer odpowiada 503 (brak konfiguracji), tak jak przy braku sekretu. Wcześniej adres brał się z każdego zapytania, więc Better Auth ufał adresowi samego żądania.
- Zaufane źródło żądań (`Origin`) pochodzi z `BETTER_AUTH_URL`. Żądanie POST z obcym `Origin` i ciasteczkiem jest odrzucane (403). Ciasteczko sesji dostaje `Secure` i `HttpOnly`, gdy adres jest https.
- Limit zapytań (logowanie, rejestracja, wysyłka kodów) zapisuje liczniki w tabeli `rate_limit` w bazie D1 zamiast w pamięci instancji Workera. Limit działa więc we wszystkich instancjach, a po restarcie nie zeruje się.

### Dodane

- Tabela `rate_limit` w schemacie Drizzle (`worker/db/schema/auth.ts`). `scripts/schemaSql.ts` odczytuje ją razem z resztą schematu.
- Testy: ciasteczko sesji ma `Secure` i `HttpOnly` przy adresie https, POST z obcym `Origin` jest odrzucany, dwie niezależne instancje na tej samej bazie współdzielą limit (druga dostaje 429), a adres aplikacji poza dev jest wymagany.

Lokalnie po świeżym checkoucie uruchom `npm run db:reset`, zanim pójdzie `npm run test:e2e`. Bez tego w `.wrangler/state` nie ma tabel.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Poprawki logowania na produkcji (gałąź fix/logowanie-prod) | Dodać `baseURL`, `trustedOrigins` z `BETTER_AUTH_URL` w obu fabrykach auth, 503 poza dev bez adresu, limit zapytań w bazie D1 (tabela `rate_limit`) i testy z dowodem, że działają. | Zmieniono `worker/auth/email/createAuth.ts`, `worker/auth/email/runtimeAuth.ts`, `worker/auth/email/testRuntime.ts`, `worker/auth/invite/createInviteAuth.ts`, `worker/auth/invite/runtimeAuth.ts`, `worker/db/schema/auth.ts`. Dodano `worker/auth/email/productionSettings.test.ts`, `worker/auth/email/runtimeAuth.test.ts`, `worker/auth/invite/runtimeAuth.test.ts`. | do uzupełnienia | do uzupełnienia |

Otwarte ryzyka, bez poprawek w tym PR:

- Zapytania bez nagłówka `cf-connecting-ip` (np. w testach e2e) dzielą kubełek `no-trusted-ip` dla każdej ścieżki. Liczniki w lokalnym stanie D1 przetrwają między uruchomieniami, więc testy e2e mogą sporadycznie dostać 429.
- Plik `.dev.vars` z `BETTER_AUTH_URL` musi wskazywać ten sam port, na którym działa aplikacja. Dla innego portu żądania POST z ciasteczkiem dostają 403 (znana uwaga z `STAN_PRAC`).
- W dev bez `.dev.vars` klucze dostępu (passkey) używają domeny `localhost`, bo tak działa wtyczka. Zmiana w tym PR nie zmienia tej domeny.
