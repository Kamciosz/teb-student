## Changelog

### Zmienione

- Nowy wpis z edytora zapisuje `author_user_id` z konta zalogowanego redaktora (z sesji). Pole `author` ani `author_user_id` z ciała zapytania jest ignorowane.
- Zmiana szkicu przez innego redaktora nie zmienia autora wpisu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3b: zapis autora wpisu z sesji (draft, baza: feat/3a-podpis-autora, PR #126) | Przy tworzeniu wpisu w `worker/news/editor/` zapisz `author_user_id` z sesji, nie z ciała. Edycja przez innego redaktora nie zmienia autora. Dodaj testy: autor z sesji, pole `author` z ciała ignorowane, edycja nie zmienia autora. Bez zmian schematu. | Zmieniło `worker/news/editor/routes.ts` (autor z `context.get('student')` przekazany do `insertEntry`), `worker/news/editor/routes.test.ts` i `worker/news/editor/author.test.ts` (prawdziwe konta w testach, sprawdzenie `authorUserId`, przypadki z podrobionym autorem w ciele i edycją przez innego redaktora) oraz ten plik. Front bez zmian. | do uzupełnienia | do uzupełnienia |
