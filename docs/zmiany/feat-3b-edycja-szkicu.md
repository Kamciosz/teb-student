# Wpisy z pull requestów

## Changelog

### Dodane

- Edycja szkicu wpisu na serwerze: odczyt `GET /api/news/editor/entries/:id` i zapis `PUT /api/news/editor/entries/:id`. Zmiany zapisują się w tym samym wpisie, bez nowego numeru. Opublikowanego wpisu nie da się edytować (odpowiedź 409).
- Kreator wpisu otwiera się z danymi szkicu pod adresem `/news/editor/:id`. Przy błędzie wczytania pokazuje się komunikat i link do panelu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #19, edycja szkicu (podtor 3b) | Dodać edycję szkicu: GET i PUT na serwerze, kreator czyta id z adresu, zapis do tego samego wpisu, testy i e2e | Dodano trasy GET i PUT w `worker/news/editor/routes.ts`, testy w `routes.test.ts` i `author.test.ts`, klient `api.ts`, ekran `NewsEditorScreen.tsx`, nowe teksty w `texts.ts` i e2e w `e2e/news-editor.spec.ts` | | |
