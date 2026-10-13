## Changelog

### Dodane

- `bellDayStatus(date?, shortenedDays?)` w drzwiach `src/features/bell/index.ts`: zwraca stan dnia: `day-off` (sobota i niedziela, niezależnie od planu), `no-plan` (plan dnia jest pusty), `before` (przed pierwszą lekcją), `during` (w trakcie lekcji albo przerwy) albo `after` (po ostatniej lekcji). Plan dnia wybiera tak samo jak licznik, czyli skrócony, gdy dzień jest na liście skróconych. Pulpit (podtor 9) użyje jej zamiast samego `hasBellPlan`, żeby nie pokazywać „Po lekcjach” w weekend.

### Zmienione

- `bellState.ts`: `LAST_WORKING_DAY`, `parseTime` i `planFor` są eksportowane do nowego modułu stanu dnia. Zachowanie licznika bez zmian.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 6: stan dnia (PR do uzupełnienia, baza `feat/6-ma-plan`) | Dodaj czystą funkcję `bellDayStatus(now, shortenedDays)` ze stanami dnia (weekend, brak planu, przed, w trakcie, po lekcjach) i wystaw ją w drzwiach `bell/index.ts`. Testy Vitest z udawanym czasem, w tym weekend i plan skrócony. Pulpitu nie ruszać. | Dodało `bellDayStatus.ts` (funkcja i typ `BellDayStatus`), `bellDayStatus.test.ts` (testy każdego stanu, weekendu, pustego i skróconego planu), zmieniło `bellState.ts` (eksport trzech pomocniczych elementów i tagi `@used_by`) i `index.ts` (eksport), oraz dodało ten plik. | do uzupełnienia | Szymon |
