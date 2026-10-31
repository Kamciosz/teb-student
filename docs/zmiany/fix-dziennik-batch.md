## Changelog

### Poprawione

- Publikacja szkicu i wpis w dzienniku zmian zapisują się razem albo wcale: oba zapisy idą w jednym batchu D1 (jednej transakcji). Gdy zapis do dziennika się nie uda, szkic zostaje szkicem i panel dostaje 500.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Atomowość publikacji i wpisu w dzienniku (gałąź fix/dziennik-batch) | Zapisać publikację i wpis w `diary_entries` razem albo wcale, przez `db.batch`; dodać test z zablokowanym dziennikiem; usunąć zdanie o braku transakcji z docs/STAN_PRAC.md. | Zmieniono worker/news/admin/queries.ts (publishDraft na batch: odczyt stanu, warunkowy wpis w dzienniku, warunkowa zmiana), worker/news/admin/routes.ts (publikacja przekazuje wykonawcę, bez osobnego zapisu do dziennika), worker/news/admin/routes.test.ts (test z triggerem na diary_entries), docs/STAN_PRAC.md (usunięte zdanie). | do uzupełnienia | do uzupełnienia |
