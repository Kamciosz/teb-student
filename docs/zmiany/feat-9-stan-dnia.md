## Changelog

### Dodane

- Gdy licznik do dzwonka nie ma stanu (`null`), nagłówek pulpitu pokazuje napis zależny od stanu dnia z `bellDayStatus()` z `src/features/bell/index.ts`, a nie samo `hasBellPlan()`. Stany: bez planu „Brak planu dzwonków”, dzień wolny „Dziś nie ma lekcji”, przed lekcjami „Lekcje jeszcze się nie zaczęły”, w trakcie „Trwa lekcja”, po lekcjach „Po lekcjach”. Nowe napisy (poza „Brak planu dzwonków”) są oznaczone TO_AGREE w `DashboardHeader.tsx`.
- Testy Vitest w `src/features/dashboard/DashboardHeader.test.tsx`: każdy stan dnia bez licznika osobno (w tym weekend, przed lekcjami i w trakcie).
- Test e2e w `e2e/dashboard.spec.ts`: sobota z planem daje „Dziś nie ma lekcji”, a 07:00 z planem daje „Lekcje jeszcze się nie zaczęły”. Oba sprawdzają, że nie ma „Po lekcjach”.

### Zmienione

- `DashboardHeader.tsx`: `hasBellPlan` zastąpione przez `bellDayStatus`, a napisy pod kreską zebrane w pełnym zestawieniu `Record<BellDayStatus, string>`. Nowy stan dnia da błąd kompilacji, zamiast cicho wypaść.
- `tiles.test.tsx`: test powitania i pustego licznika przypina czas do wtorku roboczego (2026-10-13, 11:10), bo w weekend pusty plan daje „Dziś nie ma lekcji”.
- Pliki modułu bell (`src/features/bell/`) bez zmian w tej gałęzi, poza scaleniem gałęzi `feat/6-stan-dnia` (PR #145).

### Otwarte

- Napisy do uzgodnienia z zespołem (TO_AGREE):
  - „Dziś nie ma lekcji” (TO_AGREE)
  - „Lekcje jeszcze się nie zaczęły” (TO_AGREE)
  - „Trwa lekcja” (TO_AGREE): używany tylko wtedy, gdy stan dnia to „w trakcie”, a licznik nie ma stanu (rozjazd po odświeżeniu). Zwykle licznik pokazuje minuty.
  - „Po lekcjach” (TO_AGREE): wcześniej też do uzgodnienia, teraz tylko dla stanu „po lekcjach”.
- Stan licznika odświeża się co 30 s, a stan dnia liczy się przy każdym renderze. Przy północy (po lekcjach → dzień wolny) licznik może chwilę pokazywać stary napis, bo `null` → `null` nie wywołuje ponownego renderu. Akceptowalne dla tego zadania.
- Ten PR zawiera pliki modułu bell z #145 (scalenie `feat/6-stan-dnia`). Kontrola granic w CI liczy diff względem bazy `feat/9-brak-planu`, więc może oflagować te pliki. Naprawa wymaga zmian poza podtorem 9.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 9: stan dnia na pulpicie (draft PR, baza `feat/9-brak-planu`, zawiera też #145) | Pulpit ma używać `bellDayStatus` zamiast `hasBellPlan`: weekend, przed lekcjami, w trakcie i po lekcjach. Nowe napisy oznaczyć TO_AGREE. Pliki bell bez zmian. Zaktualizować testy Vitest każdego stanu i e2e. | Zmieniło `DashboardHeader.tsx` (import `bellDayStatus`, mapa napisów `Record<BellDayStatus, string>`, lokalny obiekt TO_AGREE), `DashboardHeader.test.tsx` (mock `bellDayStatus`, testy każdego stanu), `tiles.test.tsx` (przypięty czas), `e2e/dashboard.spec.ts` (dwa nowe testy) oraz dodało ten plik. Nie zmieniało plików modułu bell. | do uzupełnienia | Szymon |
