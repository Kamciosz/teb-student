## Changelog

### Usunięte

- Funkcja „Dziś lekcje skrócone” w całości: przełącznik dnia dla Samorządu, zapis dnia i jego usuwanie, lista dni skróconych, plan skrócony w `bellPlan.ts`, tabela `bell_shortened_days` w schemacie i seedzie, trasa `/api/bell` (`worker/bell/`), testy jednostkowe i e2e tej funkcji oraz zdanie o niej w dokumentacji.

### Zmienione

- Ekran dzwonka bez wpisanego planu pokazuje krótki napis „Brak planu dzwonków” zamiast pustej strony. Ten sam napis jest na pulpicie.
- Licznik do dzwonka korzysta tylko z planu szkoły z `bellPlan.ts`. Dni skróconych nie ma (decyzja Szymona 14.10).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | build bez dni skróconych (PR do uzupełnienia) | Usunąć funkcję „Dziś lekcje skrócone” w całości, bez zastępczych przełączników, z kodem, testami, e2e i dokumentacją. | Usunęło `src/features/bell/ShortenedDaySwitch*`, `shortenedApi*`, `shortenedQueries.ts`, `worker/bell/`, `worker/db/schema/bell.ts`, `worker/db/seed/bell.ts`, zmieniło `bellState.ts`, `bellDayStatus.ts`, `BellCountdown.tsx`, `BellScreen.tsx`, `index.ts`, `bell.css`, testy bell, `worker/mounts.ts`, indeksy schematu i seeda, `e2e/bell.spec.ts`, `e2e/dashboard.spec.ts`, `docs/ARCHITECTURE.md`, `docs/PLAN_APLIKACJI.md`, `docs/STAN_PRAC.md`; dodało ten plik. | do uzupełnienia | Szymon |
