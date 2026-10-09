## Changelog

Bez zmian dla użytkownika. Dokumentacja: dwie propozycje decyzji dla Bohdana, `docs/adr/0004-obslugiwane-przegladarki.md` (lista obsługiwanych przeglądarek i cele budowania) oraz `docs/adr/0005-kroj-pisma.md` (skąd ładujemy krój Archivo). Obie mają status „Propozycja, czeka na Bohdana”.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | projekt decyzji o przeglądarkach i kroju pisma | Przygotuj dwa projekty ADR dla Bohdana: obsługiwane przeglądarki (wartości dla `@vitejs/plugin-legacy`, dane o udziale w Polsce) i krój pisma (własny plik WOFF2, Google Fonts albo krój systemowy). Oznacz fakty jako sprawdzone albo niesprawdzone, daj rekomendację. Nie zmieniaj kodu. | Sprawdziło kod wtyczki i dane MDN, zmierzyło koszt uzupełnień dla kilku list przeglądarek i wagę podzbiorów kroju poza repozytorium, odczytało dane StatCounter i licencję. Dodało `docs/adr/0004-obslugiwane-przegladarki.md`, `docs/adr/0005-kroj-pisma.md` i ten plik. | | |
