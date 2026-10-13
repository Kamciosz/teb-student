## Changelog

### Zmienione

- Bez zmian dla użytkownika. Drzwi modułu `worker/auth/index.ts` wystawiają `findStudentByEmail`, `listStudentsByIds` i `countStudents`, żeby panel Samorządu (podtor 8, #26) mógł nadawać role i liczyć uczniów bez czytania tabeli `user`.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | #72, podtor 1a: eksport wyszukiwania uczniów | Wystaw wyszukiwanie uczniów po adresie przez `worker/auth/email/index.ts` i `worker/auth/index.ts`, z testem i komentarzem PL/EN. | Dodało `worker/auth/email/studentLookup.ts` z testem, eksporty i `@uses`/`@used_by` w obu drzwiach oraz ten plik. | do uzupełnienia | do uzupełnienia |
