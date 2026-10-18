## Changelog

### Naprawione

- Tytuł pustego stanu jest nagłówkiem `h2`, a nie akapitem, więc czytnik ekranu czyta go jako tytuł. Wygląd bez zmian (`src/shared/ui/EmptyState.tsx`, `EmptyState.css`).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | fix/pusty-stan: tytuł pustego stanu jako nagłówek | Zmień `p.ui-empty-title` na `h2`, zresetuj style nagłówka w CSS i dodaj test. | Zmieniło `src/shared/ui/EmptyState.tsx`, `EmptyState.css`, `EmptyState.test.tsx` oraz dodało `docs/zmiany/fix-pusty-stan.md`. | do uzupełnienia | do uzupełnienia |
