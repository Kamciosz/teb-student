## Changelog

### Dodane

- Baza D1 dla serwera: binding `DB` w `wrangler.jsonc`, typ `Env` i pole `db` w `DeleteStudentDataInput` (`worker/shared/`). Bindingu `DB` używa też serwer deweloperski.
- Polecenia `npm run db:reset` (tworzy bazę lokalną od nowa ze schematu Drizzle, bez migracji) i `npm run db:seed` (wpisuje dane testowe modułów). `npm run test:e2e` robi oba sam.
- Testy Vitest dostają bazę z tabelami ze schematu przed każdym plikiem testów. Test podtoru importuje tabelę i używa `env.DB`.
- Opis dla podtorów w `docs/ARCHITECTURE.md` („Baza danych”): jak dodać tabelę i dane testowe, jak uruchomić bazę i jak użyć jej w teście.

### Zmienione

- Testy kasowania danych ucznia w siedmiu modułach podają bazę testową (`db: env.DB`), bo pole `db` jest teraz wymagane. To jedyna zmiana w plikach podtorów.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | #39, podtor 0: baza D1 | Dodaj binding DB, typ Env, tworzenie bazy ze schematu bez migracji i tabele w testach Vitest. | Dodało `drizzle.config.ts`, `scripts/` (schemat na SQL, `db:reset`, `db:seed`), `worker/shared/testSetup.ts`, `worker/shared/seed.ts`, `worker/shared/db.test.ts`. Zmieniło `wrangler.jsonc`, `vitest.config.ts`, `package.json` (skrypty), `tsconfig.node.json`, `worker/mounts.ts`, `worker/shared/index.ts`, siedem testów `deleteStudentData.test.ts` i dokumentację. | do uzupełnienia | do uzupełnienia |
