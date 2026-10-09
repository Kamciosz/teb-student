## Changelog

### Dodane

- Aktualności dla ucznia: lista opublikowanych wpisów od najnowszego z filtrem po typie (Ważne, News, Wydarzenie, Sport) i ekran pojedynczego wpisu z treścią, przyciskiem z linkiem oraz filmem z YouTube (miniatura, odtwarzacz dopiero po kliknięciu).
- Serwer aktualności: `GET /api/news/feed` i `GET /api/news/feed/:id`. Zwracają tylko wpisy opublikowane, a szkic wygląda jak nieistniejący wpis (404). Uczeń nie ma żadnego adresu do dodania ani zmiany wpisu.
- Tabela wpisów w schemacie bazy i dane przykładowe (`NEWS_SEED_SETS`: osiem wpisów opublikowanych i dwa szkice).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | #17, aktualności: lista i wpis | Zrobić cienką ścieżkę od ekranu do bazy dla listy i wpisu aktualności (tylko opublikowane), z testami i szkicem pull requestu. | Dodało tabelę wpisów i dane przykładowe (`worker/db/schema/news.ts`, `worker/db/seed/news.ts`), serwer (`worker/news/feed/`), ekrany listy i wpisu z czyszczeniem treści JSON (`src/features/news/feed/`), testy Vitest na prawdziwym D1 z testów i test Playwright (`e2e/news-feed.spec.ts`). Ekran korzysta ze wspólnego dostawcy zapytań i wspólnego paska „Brak internetu”. | | |
