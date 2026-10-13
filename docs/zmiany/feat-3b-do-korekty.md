## Changelog

### Dodane

- Redaktor wysyła wpis do korekty przyciskiem „Wyślij do korekty” na podglądzie (wpis dostaje stan „do korekty” i nie widzi go uczeń).
- Wpis w korekcie otwiera się w podglądzie. Redaktor, który nie jest jego autorem, zatwierdza go przyciskiem „Zatwierdź i opublikuj” i wpis jest publikowany. Autor widzi tylko komunikat, że wpis czeka na korektę.
- Serwer pilnuje zasad: wpis zatwierdza tylko inny redaktor niż autor (inaczej odpowiedź 403 z powodem „own_entry”), a zmiana z niewłaściwego stanu daje 409 (wpis w korekcie, już nie w korekcie, albo już opublikowany).

### Zmienione

- Edycja szkicu nie zmienia już wpisu, który jest w korekcie: zapis zwraca 409 z powodem „in_review”.

### Do ustalenia przez zespół

- Przycisk „Opublikuj” przy nowym wpisie nadal publikuje bez korekty. Zmiana wymaga decyzji produktu (ekran 5.3 i istniejący test).
- Teksty spoza EKRANY.md (przyciski, komunikaty, opisy stanów) są w `src/features/news/editor/texts.ts` w grupie „TO_AGREE”.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3b, „Do korekty”, część #141 | Dodaj wysyłkę do korekty i zatwierdzenie (inny redaktor niż autor), z testami Vitest i e2e. | Dodało akcje w `worker/news/editor/routes.ts` (POST `/entries/:id/approve`, sprawdzenie autora, odpowiedzi 403/409), testy w `routes.test.ts`, front w `src/features/news/editor/` (`ReviewStep.tsx`, przyciski w `PreviewStep.tsx`, `NewsEditorScreen.tsx`, `api.ts`, `texts.ts`), przypadki w `e2e/news-editor.spec.ts` i ten plik. | do uzupełnienia | do uzupełnienia |
