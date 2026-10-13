## Changelog

### Dodane

- Licznik do dzwonka na pulpicie pokazuje minuty, gdy `currentBellState()` z `src/features/bell/index.ts` zwraca stan (trwa lekcja albo przerwa). Pod liczbą jest „min” i „do dzwonka”. W przerwie napis też brzmi „do dzwonka”, bo liczba odlicza do początku następnej lekcji. Napisy do uzgodnienia z zespołem.
- Odświeżanie licznika co 30 sekund, tylko gdy karta jest widoczna (`document.visibilityState`). Po powrocie do karty licznik od razu pokazuje aktualną minutę (`src/features/dashboard/bellTicker.ts`, hook `useBellState.ts`).

### Zmienione

- Gdy stanu nie ma (`null`), nagłówek zostaje bez zmian: kreska i „Brak planu dzwonków”.

### Otwarte

- Drzwi modułu bell nie mówią, czy plan jest pusty, czy trwa czas poza lekcjami. Oba przypadki dają `null`, więc po wypełnieniu planu pulpit poza lekcjami nadal pokaże „Brak planu dzwonków”. Naprawa wymaga funkcji w `src/features/bell/index.ts`, np. `hasBellPlan()`, poza tym podtorem.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 9: minuty dzwonka (PR do uzupełnienia) | Pokaż w nagłówku pulpitu minuty z `currentBellState()`, odświeżaj co 30 s tylko przy widocznej karcie, przy `null` zostaw obecny tekst, dodaj testy z udawanym czasem i jeden przypadek e2e. | Dodało `bellTicker.ts` (odświeżanie i pauza przy ukrytej karcie), `useBellState.ts` (hook), `DashboardHeader.tsx` (`BellReadout` z minutami albo kreską), testy `bellTicker.test.ts` i `DashboardHeader.test.tsx`, zmieniło test pustego planu w `e2e/dashboard.spec.ts` (stały zegar w godzinie lekcji) oraz dodało ten plik. Nie zmieniło plików modułu bell. | do uzupełnienia | Szymon |
