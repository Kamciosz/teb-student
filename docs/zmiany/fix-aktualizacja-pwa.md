## Changelog

### Poprawione

- Otwarta aplikacja po wdrożeniu nie zostaje już ze starymi plikami. Gdy fragment kodu nie istnieje, strona przeładowuje się od razu, także bez service workera. Gdy nowa wersja service workera przejmuje stronę, strona przeładowuje się przy powrocie do aplikacji albo przy zmianie ekranu. Pierwsza instalacja service workera nie powoduje przeładowania. Przeładowania dzieli co najmniej minuta, więc strona nie wpada w pętlę. Zmiana service workera nie przeładowuje strony w trakcie pisania, bo czeka na powrót z tła albo zmianę ekranu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Aktualizacja PWA po wdrożeniu (gałąź fix/aktualizacja-pwa, PR do uzupełnienia) | Przeładować stronę raz w sesji, gdy fragment kodu się nie pobrał; nie w trakcie pisania; tylko po przejęciu strony przez nowy SW i po powrocie z tła albo zmianie ekranu; test, który na starym kodzie się wywala. | Dodano src/shared/pwa/staleBuildReload.ts (logika), src/shared/pwa/browserEnv.ts (zależności z przeglądarki), src/shared/pwa/index.ts (drzwi modułu), src/shared/pwa/staleBuildReload.test.ts (8 testów). Podpięto w src/App.tsx (useEffect). Dopisano akapit w docs/ARCHITECTURE.md. | do uzupełnienia | Szymon |
| 2026-10-31 | Aktualizacja PWA po wdrożeniu, poprawka PR #213 | Null → SW nie przeładowuje; błąd pobrania przeładowuje od razu, także bez SW; znacznik z czasem i odstęp 60 s (błąd po 61 s daje drugie przeładowanie); testy każdego przypadku i mutacje M1–M4. | Przepisano src/shared/pwa/staleBuildReload.ts (czas w środowisku, bez checkForUpdate, bramka nowej wersji tylko dla zmiany SW z istniejącego na inny) i src/shared/pwa/browserEnv.ts (dodano now). Przepisano src/shared/pwa/staleBuildReload.test.ts (12 testów). Zaktualizowano komentarz w src/App.tsx i ten dokument. | do uzupełnienia | Szymon |
