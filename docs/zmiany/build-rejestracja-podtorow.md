## Changelog

### Dodane

- Rejestr podtorów: router w telefonie (`src/app/routes.ts`) i lista routerów serwera (`worker/mounts.ts`) z wpisem dla każdego z 15 podtorów. Każdy ekran pokazuje „W budowie”.
- Dolny pasek i menu panelu Samorządu (`src/shared/navigation/items.ts`) z wpisami z `docs/projekt/EKRANY.md`.
- Katalogi podtorów w `src/features/` i `worker/` z własnym `index.ts` oraz `index.ts` modułów, które je zbierają.
- Pliki schematu bazy i danych testowych dla każdego modułu (puste) oraz plik, który je zbiera.
- Lista funkcji kasujących dane ucznia (`worker/shared/accountDeletion.ts`) i funkcja dla każdego z siedmiu modułów z danymi ucznia (na razie nic nie robi).
- Testy Vitest: każdy podtor ma wpis w routerze i na serwerze, a lista kasowania ma wpis dla każdego modułu z danymi ucznia. Testy Playwright: adresy `/`, `/surveys/vote` i `/news/admin` pokazują „W budowie”.
- `docs/adr/0003-adresy-podtorow.md` (do zatwierdzenia przez Bohdana).

### Zmienione

- Ekran startowy z nagłówkiem „TEB Student” zastąpił pulpit pod adresem `/` z napisem „W budowie”. Test Playwright ekranu startowego zastąpiły testy trzech adresów.
- `docs/ARCHITECTURE.md` ma mapę modułów zgodną z kodem. `docs/PODZIAL_PRACY.md` ma stan po etapie A.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | etap A, rejestracja podtorów (`build/rejestracja-podtorow`) | Zarejestruj wszystkie podtory z `docs/PODZIAL_PRACY.md` w routerze, na serwerze, w dolnym pasku i menu panelu, w schemacie bazy i na liście kasowania danych ucznia. Dodaj testy, które oblewają przy braku wpisu. | Dodało `src/app/`, `src/features/` (ekrany „W budowie” i `index.ts`), `worker/<moduł>/`, `worker/mounts.ts`, `worker/shared/`, `worker/db/`, wspólne elementy w `src/shared/`, testy Vitest i Playwright, `docs/adr/0003-adresy-podtorow.md`. Zmieniło `src/App.tsx`, `src/main.tsx`, `worker/index.ts`, `docs/ARCHITECTURE.md`, `docs/PODZIAL_PRACY.md`. | | |
