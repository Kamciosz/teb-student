## Changelog

### Zmienione

- CI w jobie „Build i testy” instaluje Chromium i uruchamia testy e2e Playwright (`npm run test:e2e`). Test ekranu startowego biegnie teraz na każdym pull requeście i na `main`, więc zepsuta ścieżka czerwieni CI.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | e2e w CI | Dodaj do CI instalację Chromium i uruchomienie testów e2e. Sprawdź, że test biegnie i że celowo zepsuta asercja czerwieni CI. | Dodało dwa kroki w `.github/workflows/ci.yml`. Zmieniło komentarz z poleceniami w `AGENTS.md`. Dodało ten plik. | do uzupełnienia | Adam |
