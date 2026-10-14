## Changelog

### Dodane

- `hasBellPlan(date?, shortenedDays?)` w drzwiach `src/features/bell/index.ts`: zwraca `true`, gdy plan na dany dzień ma choć jedną lekcję (zwykły albo skrócony, zależnie od tego, czy dzień jest na liście skróconych, tak jak w `currentBellState`). Pulpit (podtor 9) użyje jej, żeby odróżnić „brak planu” od „po lekcjach”.

### Zmienione

- Ekran dzwonka (`/bell`): gdy dzisiejszy plan jest pusty, zamiast pustego ekranu pokazuje napis „Brak planu dzwonków” (ten sam, co na pulpicie). Napis jest do uzgodnienia (TO_AGREE), bo nie ma go w `docs/projekt/EKRANY.md`.
- `currentBellState` wybiera plan przez wspólną funkcję `planFor`; zachowanie bez zmian.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 6: ma plan (PR do uzupełnienia, baza `feat/6-skrocone-front`) | Wystaw `hasBellPlan` w drzwiach `bell/index.ts` (zwykły albo skrócony plan, z lekcją → true); na ekranie dzwonka przy pustym planie pokaż krótki napis zamiast licznika; testy Vitest i e2e. Pulpitu nie ruszać. | Zmieniło `bellState.ts` (`planFor`, `hasBellPlan`), `index.ts` (eksport `hasBellPlan`), `BellScreen.tsx` (napis przy pustym planie), `bell.css` (klasa `.bell-empty`), `index.test.ts` (testy `hasBellPlan`), `e2e/bell.spec.ts` (napis obecny/nieobecny) oraz dodało ten plik. | do uzupełnienia | Szymon |
