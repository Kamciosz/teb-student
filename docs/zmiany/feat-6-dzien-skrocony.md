## Changelog

### Zmienione

- Lekcje skrócone na wybrany dzień (tylko serwer i logika, bez ekranu). Tabela `bell_shortened_days` przechowuje dzień (RRRR-MM-DD), kto go włączył i kiedy. Adres `GET /api/bell/shortened` zwraca dni skrócone od dziś dla zalogowanego ucznia. `POST` i `DELETE /api/bell/shortened/:date` włączają i wyłączają dzień tylko dla Samorządu (uczeń bez roli dostaje 403, zła data 400).
- W `src/features/bell/` dodano pusty `SHORTENED_BELL_PLAN` obok `BELL_PLAN`. Godziny planu skróconego poda szkoła (TO_AGREE). Dopóki lista jest pusta, skrócony dzień nie pokazuje licznika.
- `currentBellState` przyjmuje drugi, opcjonalny argument: zbiór dni skróconych. Dzień z tego zbioru bierze plan skrócony, pozostałe dni plan zwykły. Bez argumentu działa jak dotąd.
- `e2e/bell.spec.ts`: podstawiony moduł planu eksportuje też pusty `SHORTENED_BELL_PLAN`, bo nowy import z tego modułu musi istnieć.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 6: lekcje skrócone (PR do uzupełnienia) | Tabela dni skróconych, GET dla ucznia, POST i DELETE tylko dla Samorządu, pusty plan skrócony i wybór planu w `currentBellState` według dnia, testy Vitest i e2e. | Zmieniło `worker/db/schema/bell.ts` (tabela), `worker/bell/routes.ts` i nowe `worker/bell/shortenedDay.ts` (adresy i sprawdzanie daty), nowy `worker/bell/routes.test.ts`, `src/features/bell/bellPlan.ts` (pusty plan skrócony), `bellState.ts` (`warsawDate`), `index.ts` (wybór planu) i `index.test.ts`, `e2e/bell.spec.ts` (stub planu), oraz dodało ten plik. | do uzupełnienia | Szymon |
