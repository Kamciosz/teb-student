## Changelog

### Naprawione

- Nieznany adres, np. `/surveys` (sam początek podtoru bez ekranu), pokazuje ekran „Nie ma takiej strony” z przyciskiem „Wróć na pulpit” zamiast surowego błędu „Unexpected Application Error! 404 Not Found”.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Jak sprawdzono |
|---|---|---|---|---|---|
| 2026-11-01 | Nieznany adres (gałąź fix/nieznany-adres) | Naprawić ekran dla nieznanego adresu zamiast surowego błędu 404 | Dodało catch-all `*` w `src/app/routes.ts`, ekran `src/app/NotFoundScreen.tsx` i jego CSS, test `src/app/NotFoundScreen.test.tsx`, ten plik zmian | Nic | Test padał przed dodaniem trasy `*` (3 z 3) i przechodzi po niej; komendy z polecenia w raporcie PR |
