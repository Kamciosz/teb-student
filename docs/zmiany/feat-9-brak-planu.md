## Changelog

### Dodane

- Gdy licznik do dzwonka nie ma stanu (`null`) i plan dnia ma lekcje, nagłówek pulpitu pokazuje „Po lekcjach” zamiast „Brak planu dzwonków”. Sprawdzenie idzie przez `hasBellPlan()` z `src/features/bell/index.ts`. Napis do uzgodnienia z zespołem.
- Testy Vitest z udawanym czasem w `src/features/dashboard/DashboardHeader.test.tsx`: brak planu, plan poza lekcjami i trwająca lekcja.
- Test e2e w `e2e/dashboard.spec.ts`: plan przykładowy podstawiony przez `page.route` na moduł planu (bez zmian w bell) daje 30 minut w lekcji i „Po lekcjach” po ostatniej lekcji.

### Zmienione

- Bez planu (`hasBellPlan()` zwraca `false`) nagłówek zostaje bez zmian: kreska i „Brak planu dzwonków”.

### Otwarte

- „Po lekcjach” to napis do uzgodnienia z zespołem (TO_AGREE).
- `hasBellPlan()` nie patrzy na dzień tygodnia ani na godzinę przed pierwszą lekcją. Gdy plan jest wypełniony, o 7:00 i w weekend nagłówek też pokaże „Po lekcjach”. Naprawa wymaga zmiany w `src/features/bell/`, poza tym podtorem.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 9: brak planu i po lekcjach (draft PR, baza feat/6-ma-plan, zawiera też #136) | Gdy licznik nie ma stanu, pokaż „Po lekcjach” przy planie z `hasBellPlan()` i „Brak planu dzwonków” bez planu. Dodaj testy Vitest z udawanym czasem i przypadek e2e z podstawionym planem. Nie zmieniaj plików bell. | Zmieniło `DashboardHeader.tsx` (import `hasBellPlan`, napis w gałęzi `null`), `DashboardHeader.test.tsx` (mock `hasBellPlan`, dwa nowe przypadki), `e2e/dashboard.spec.ts` (podstawienie planu przez `page.route`, dwa testy) oraz dodało ten plik. Nie zmieniało plików modułu bell. | do uzupełnienia | Szymon |
