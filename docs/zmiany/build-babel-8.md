## Changelog

### Zmienione

- Babel 8: `@babel/core` 8.0.6, `@babel/runtime` 8.0.5 i `@babel/plugin-transform-runtime` 8.0.6, podniesione razem. Zastępuje pull requesty Dependabota #36, #37 i #38, które podnosiły po jednej paczce i nie instalowały się.
- Dependabot podnosi paczki `@babel/*` jednym pull requestem i nie proponuje `@types/node` w wersji głównej wyższej niż Node z `.nvmrc` (22). Zamyka #35.
- Bez zmian dla użytkownika.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | Aktualizacje Dependabota #35–#38 | Sprawdź i napraw pull requesty Dependabota. | Podniosło trzy paczki Babel razem (`package.json`, `package-lock.json`), zmieniło `.github/dependabot.yml` i dodało ten plik. Sprawdziło lint, 257 testów, build i obecność React Compiler w wyniku budowania. | do uzupełnienia | Szymon |
