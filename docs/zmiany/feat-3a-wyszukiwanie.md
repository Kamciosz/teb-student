## Changelog

### Dodane

- Pole szukania nad listą aktualności (ekran 2.2): tekst „Szukaj wpisów”, przycisk „Wyczyść” widoczny, gdy coś jest wpisane, i długość tekstu do 100 znaków.
- Szukanie idzie do serwera z opóźnieniem 300 ms po ostatniej literze, więc nie wysyła zapytania przy każdym znaku. Lista zostaje na ekranie, dopóki przychodzi nowy wynik, zamiast mrugać na pusto.
- Gdy nic nie pasuje, lista pokazuje „Nic nie znaleziono dla „…””, z szukanym tekstem. Bez szukania komunikaty zostają bez zmian.
- Serwer: parametr `q` w `GET /api/news/feed`. Szuka w tytule i treści tylko opublikowanych wpisów, bez względu na wielkość liter (także dla polskich liter) i spacje na brzegach. Tekst dłuższy niż 100 znaków dostaje 400 `query_too_long`, zanim dotknie bazy.
- Wyniki szukania są ograniczone tym samym limitem co lista (50 wpisów), liczonym już po dopasowaniu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3a: wyszukiwanie we wpisach | Dodaj wyszukiwanie we wpisach: parametr `q` w liście z limitem długości, pole szukania nad listą z opóźnieniem 300 ms, komunikat przy pustym wyniku i czyszczenie pola; z testami i e2e. | Dodało szukanie w `worker/news/feed/` (`queries.ts`, `routes.ts`, `excerpt.ts` i testy), pole `SearchField.tsx`, hak `useDebouncedValue.ts`, zmiany w `FeedListScreen.tsx`, `hooks.ts`, `api.ts` i `feed.css` w `src/features/news/feed/`, test w `e2e/news-feed.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
