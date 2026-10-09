## Changelog

### Naprawione

- Bez zmian dla użytkownika. Zamknięta luka w narzędziu deweloperskim: serwer deweloperski starego esbuild (< 0.25.0, GHSA-67mh-4wv8-2f99) pozwalał dowolnej stronie wysyłać do niego żądania i czytać odpowiedzi. Starą wersję 0.18.20 ciągnęło `drizzle-kit` przez `@esbuild-kit/esm-loader`. W `package.json` dodano `overrides`, które podnoszą tę jedną zależność do esbuild 0.25.12, czyli wersji, której `drizzle-kit` już używa.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | luka esbuild (alert Dependabot #1) | Napraw alert Dependabot o esbuild < 0.25.0 bez zmiany wersji technologii z `docs/TECHNOLOGIE.md`. | Ustaliło, że starą wersję ciągnie `drizzle-kit`. Dodało `overrides` w `package.json`, odświeżyło `package-lock.json` i dodało ten plik. | do uzupełnienia | do uzupełnienia |
