## Changelog

### Dodane

- Bez zmian dla użytkownika. Nowy stan wpisu „in_review” (do korekty) w schemacie news. Wpis w tym stanie czeka na drugiego redaktora i nie widzi go uczeń, bo lista i wpis po numerze filtrują tylko stan „published”. Samo zgłoszenie do korekty i zatwierdzenie dojdą w podtorze 3b.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3a, status „do korekty”, część #126 | Dopisz stan „in_review” do listy stanów wpisu i sprawdź, że lista ucznia go nie pokazuje. | Dopisało „in_review” do `NEWS_ENTRY_STATUSES` w `worker/db/schema/news.ts`, dodało test w `worker/news/feed/queries.test.ts` i ten plik. | do uzupełnienia | do uzupełnienia |
