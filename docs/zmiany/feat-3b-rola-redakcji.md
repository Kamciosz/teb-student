## Changelog

### Zmienione

- Zapis wpisu w edytorze (`POST /api/news/editor/entries`) wpuszcza redakcję gazetki, Samorząd i administratora. Strażnik `requireNewsAuthor` korzysta teraz z roli z podtoru 8 (`requirePanelRole('editor')`) zamiast odpowiadać 403 każdemu. Bez sesji odpowiada 401, uczeń bez roli dostaje 403.
- Routery wpisów z podtorów 3b i 3c dostają ten sam strażnik, więc zmiana działa tam bez zmian w ich kodzie.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3b: rola redakcji przy zapisie wpisu | Podłącz `requireNewsAuthor` do `requirePanelRole('editor')`, dopisz testy 401/403/201 dla ról redakcji, Samorządu i administratora. | Zmieniło `worker/news/editor/author.ts` (strażnik z podtoru 8, zawężony typ środowiska do ucznia), `worker/news/editor/index.ts` (komentarz) i dodało `worker/news/editor/author.test.ts`. | do uzupełnienia | do uzupełnienia |
