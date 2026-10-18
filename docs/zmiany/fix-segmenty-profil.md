## Changelog

### Naprawione

- Wybór szkoły i motywu w profilu: przy wąskim ekranie i większym tekście segmenty nie układają się już w nierówne rzędy. Gdy opcje mieszczą się w jednym rzędzie, mają równą szerokość. Gdy się nie mieszczą, każda ma własny rząd na pełną szerokość.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | Segmenty szkoły i motywu w profilu, fix/segmenty-profil | Naprawić nierówne segmenty na 320 px przy większym tekście, zrobić zrzuty przed i po, bramki i PR bez merge | Zmieniło `src/features/profile/profile.css` (reguły `.pf-segment`), dodało ten plik | — | Szymon |
