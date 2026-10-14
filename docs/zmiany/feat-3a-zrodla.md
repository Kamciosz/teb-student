## Changelog

### Dodane

- Sekcja „Źródła” na końcu wpisu u ucznia: nagłówek i lista linków. Każdy link pokazuje domenę bez „www.” (np. „gov.pl”) i pod nią adres bez „https://”, a otwiera się w nowej karcie z `rel="noopener noreferrer"`.
- Telefon czyści adresy źródeł: zostają tylko adresy https. Adres „javascript:” albo http odpada, a sekcja bez żadnego poprawnego adresu znika razem z nagłówkiem.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | podtor 3a, sekcja „Źródła” na końcu wpisu | Pokaż sekcję „Źródła” u ucznia: sanitize przepuszcza tylko https, lista linków z domeną, target="_blank" i rel="noopener noreferrer", testy Vitest. Edytora nie ruszać. | Dodało czyszczenie węzła `sources` w `sanitize.ts`, komponent `SourceList.tsx`, podpięcie w `RichContent.tsx`, style w `feed.css`, testy `SourceList.test.tsx` i ten plik. | do uzupełnienia | do uzupełnienia |
