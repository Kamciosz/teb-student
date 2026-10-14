## Changelog

### Zmienione

- Publikacja wpisu w korekcie zwraca teraz osobny kod: `409` z `{ "error": "in_review" }` zamiast mylącego `already_published` (`worker/news/admin/queries.ts::publishDraft`, `worker/news/admin/routes.ts`). Panel nadal nie publikuje wpisu w korekcie; robi to zatwierdzenie z podtoru 3b.
- Test `worker/news/admin/routes.test.ts` sprawdza trzy przypadki publikacji: szkic daje 200, wpis w korekcie daje 409 `in_review` i baza bez zmian, opublikowany wpis daje 409 `already_published`.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 3c, publikacja wpisu w korekcie (draft) | Zwróć osobny wynik i kod 409 `in_review` dla publikacji wpisu w korekcie, dopisz testy trzech przypadków. | Zmieniło `worker/news/admin/queries.ts`, `worker/news/admin/routes.ts`, `worker/news/admin/routes.test.ts`, `src/features/news/admin/api.ts` (komentarze) oraz ten plik. | do uzupełnienia | do uzupełnienia |
