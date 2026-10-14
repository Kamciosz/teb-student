## Changelog

### Zmienione

- Zdjęcie w treści wpisu przechodzi na serwerze tylko wtedy, gdy adres to względny adres modułu media: `/api/media/<id>`, gdzie `<id>` to od 1 do 64 znaków z liter, cyfr, `_` i `-`. Adresy https, `javascript:`, `data:` i ścieżki z `..` są odrzucane kodem `bad_image` (`worker/news/editor/validateBody.ts`, `isImageValid`).
- Podpis, opis i wymiary zdjęcia sprawdzane jak dotąd.
- Linki w tekście, źródła i karty linków nadal wymagają https.

### Otwarte

- Komentarz przy węźle zdjęcia w `src/features/news/editor/document/nodes.ts` nadal mówi, że adres zdjęcia musi być https. Jest nieaktualny po tej zmianie. Poprawka jest we froncie, poza tym podtorem, więc zostaje do osobnego zadania.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | podtor 3b: zdjęcie z mediów, część #45 | Sprawdzanie węzła `image` na serwerze tylko dla adresów `/api/media/<id>`, testy Vitest dla przypadków z listy. | Zmieniło `validateBody.ts` (wzorzec `MEDIA_SRC_PATTERN` i sprawdzenie typu przed wzorcem), `validateBody.test.ts` (fixture zdjęcia na `/api/media/abc`, nowe przypadki odrzucenia) oraz dodało ten plik. Edytor w `worker/news/editor` nie ma osobnego sprawdzania zdjęć, więc nic więcej nie zmieniło. | do uzupełnienia | Szymon |
