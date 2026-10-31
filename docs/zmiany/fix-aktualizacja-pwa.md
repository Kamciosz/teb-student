## Changelog

### Poprawione

- Otwarta aplikacja po wdrożeniu nie zostaje już ze starymi plikami. Gdy fragment kodu nie istnieje, strona przeładowuje się raz w sesji karty. Dzieje się to dopiero po przejęciu strony przez nowy service worker i po powrocie do aplikacji albo zmianie ekranu. W trakcie pisania strona się nie przeładowuje.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Aktualizacja PWA po wdrożeniu (gałąź fix/aktualizacja-pwa, PR do uzupełnienia) | Przeładować stronę raz w sesji, gdy fragment kodu się nie pobrał; nie w trakcie pisania; tylko po przejęciu strony przez nowy SW i po powrocie z tła albo zmianie ekranu; test, który na starym kodzie się wywala. | Dodano src/shared/pwa/staleBuildReload.ts (logika), src/shared/pwa/browserEnv.ts (zależności z przeglądarki), src/shared/pwa/index.ts (drzwi modułu), src/shared/pwa/staleBuildReload.test.ts (8 testów). Podpięto w src/App.tsx (useEffect). Dopisano akapit w docs/ARCHITECTURE.md. | do uzupełnienia | Szymon |
