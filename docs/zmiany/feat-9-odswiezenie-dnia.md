## Changelog

### Dodane

- `src/features/dashboard/useBellState.ts`: eksportowany odczyt `readBellSnapshot()` zwraca `{ state, day }` z `currentBellState()` i `bellDayStatus()`. Za każdym razem to nowy obiekt, więc każdy takt zegara wymusza ponowny rysunek, nawet gdy licznik nadal jest `null`.
- Test Vitest `src/features/dashboard/useBellState.test.tsx` z udawanym czasem: piątek 23:59:30 → sobota 00:00:00 zmienia „Po lekcjach” na „Dziś nie ma lekcji”, a poniedziałek 07:59:30 → 08:00:00 zmienia „Lekcje jeszcze się nie zaczęły” na licznik z minutami. Test prowadzi tym samym odświeżaniem co hook i sprawdza, że każdy odczyt to nowy obiekt.

### Zmienione

- `useBellState.ts`: hook zwraca `BellSnapshot` (`{ state, day }`) zamiast samego stanu licznika. Odświeżanie idzie przez `readBellSnapshot`.
- `bellTicker.ts`: `startBellTicker` i `BellTickerOptions` są generyczne (`<T>`), więc odświeżają dowolny odczyt. Zachowanie bez zmian, testy `bellTicker.test.ts` przechodzą bez edycji.
- `DashboardHeader.tsx`: `bellDayStatus()` nie jest już wołane w renderze. Stan dnia przychodzi z hooka, a import `bellDayStatus` zniknął.
- Pliki modułu bell (`src/features/bell/`) bez zmian.

### Otwarte

- Podpięcie hooka (`useEffect` z `startBellTicker`) nie ma testu jednostkowego, bo w repo nie ma jsdom ani testing-library, a nowych pakietów nie dodajemy. Test sprawdza odczyt i odświeżanie, a sam hook pokrywa tylko e2e, które działa na prawdziwym zegarze i nie sprawdzi północy.
- Napisy do uzgodnienia z zespołem (TO_AGREE) bez zmian: „Dziś nie ma lekcji”, „Lekcje jeszcze się nie zaczęły”, „Trwa lekcja”, „Po lekcjach”.
- Test `worker/reports/listMyReports.test.ts` („zwraca dokładnie pola dla ucznia”) pada w tym worktree. Plik nie zmienił się względem `origin/feat/9-stan-dnia` i nie importuje dashboardu, więc to problem gałęzi bazowej, poza podtorem 9.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 9: odświeżanie stanu dnia na pulpicie (draft PR, baza `feat/9-stan-dnia`, PR #149) | Gdy licznik zostaje `null`, napis dnia ma się zmieniać przy przejściu przez północ i przy początku lekcji. Widok liczy stan dnia przy każdym takcie zegara. Pliki bell bez zmian. Test Vitest z udawanym czasem. | Zmieniło `useBellState.ts` (odczyt `{ state, day }`), `bellTicker.ts` (typ generyczny `<T>`), `DashboardHeader.tsx` (stan dnia z hooka) oraz dodało `useBellState.test.tsx` i ten plik. Nie zmieniało plików modułu bell. | do uzupełnienia | Szymon |
