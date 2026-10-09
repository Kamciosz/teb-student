## Changelog

### Dodane

- Jeden wspólny klient zapytań (TanStack Query) w korzeniu aplikacji. Ostatnio pobrane dane zapisują się w telefonie (localStorage) na 24 godziny, więc po ponownym otwarciu aplikacji bez internetu uczeń widzi to, co pobrał ostatnio. Ekrany podtorów używają `useQuery` bez własnego dostawcy.
- Funkcja `clearQueryData` (z `src/shared`): czyści dane zapisane w telefonie. Wywołują ją wylogowanie i usunięcie konta, żeby następna osoba na tym telefonie nie widziała cudzych danych.
- Pasek „Brak internetu” na górze aplikacji. Pojawia się bez sieci i podaje, od kiedy dane są stare (chwila ostatniego pobrania), na przykład „Dane z 9.10, 14:05.”.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | #44 i #39 punkt 4, podtor 0: dostawca zapytań | Dodaj jeden QueryClient z zapisem w localStorage, funkcję czyszczenia danych i pasek „Brak internetu” z informacją, od kiedy dane są stare. | Dodało `src/shared/query/` (klient, zapis, czyszczenie, dostawca), `src/shared/ui/OfflineNotice.tsx` i `OfflineBanner.tsx`, testy Vitest, test `e2e/offline.spec.ts`. Zmieniło `src/App.tsx` i `src/shared/index.ts`. | do uzupełnienia | do uzupełnienia |
