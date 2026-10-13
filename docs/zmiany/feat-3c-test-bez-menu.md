## Changelog

### Zmienione

- `e2e/news-admin.spec.ts` (podtor 3c) nie zależy już od menu panelu. Test podstawia sesję i rolę redaktorki (`/api/admin/me` zwraca `editor`), tak jak `e2e/admin.spec.ts`, a asercja liczby linków w nawigacji „Panel Samorządu” została usunięta. Asercje ekranu wpisów (kafle, „Opublikuj”, usuwanie, pusty stan, 403, 320 px, brak internetu) zostają bez zmian.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Issue #77, PR 1 z 3: test 3c bez menu | Uniezależnij `e2e/news-admin.spec.ts` od menu panelu, zachowaj asercje ekranu wpisów. | Zmieniło `e2e/news-admin.spec.ts` (stuby sesji i `/api/admin/me`, usunięta asercja menu) oraz ten plik. | do uzupełnienia | do uzupełnienia |
