## Changelog

### Naprawione

- Stopka „Redakcja gazetki” pokazuje się tylko pod wpisami autora z rolą redakcji (rola `editor` w panelu). Wcześniej była pod każdym wpisem, także pod ogłoszeniami Samorządu. Wpis bez autora albo autor bez tej roli nie ma stopki. Podpis „Autor: …” zostaje bez zmian.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | stopka redakcji (podtor 3a) | Stopka „Redakcja gazetki” tylko przy autorze z rolą `editor`; zakres podtoru 3a, bez zmian w module admin i schemacie. | Serwer: flaga `byEditorialTeam` w `worker/news/feed/queries.ts` i `routes.ts` (lewe złączenie z `panelRoles`, tylko odczyt). Front: `EntrySignature.tsx`, `EntryScreen.tsx`, `types.ts`, `feed.css`. Testy: `EntrySignature.test.tsx`, `queries.test.ts`, `routes.test.ts`, `e2e/news-feed.spec.ts`. Ten plik. | do uzupełnienia | do uzupełnienia |
