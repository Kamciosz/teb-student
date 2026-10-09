## Changelog

### Zmienione

- Workflow CI ma uprawnienia tylko do czytania repozytorium (`permissions: contents: read`). Zamyka dwa alerty CodeQL „Workflow does not contain permissions” w `.github/workflows/ci.yml`.
- Bez zmian dla użytkownika.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | Alerty CodeQL #1 i #3 | Napraw alerty CodeQL o uprawnieniach workflow. | Dodało `permissions: contents: read` w `.github/workflows/ci.yml` i ten plik. | do uzupełnienia | Szymon |
