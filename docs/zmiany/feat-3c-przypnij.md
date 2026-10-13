## Changelog

### Dodane

- Przycisk „Przypnij” / „Odepnij” przy opublikowanym wpisie w panelu Samorządu (`/news/admin`). Przypięty wpis dostaje czas przypięcia, odpięty go traci i wraca na swoje miejsce na liście ucznia.
- Najwyżej 3 wpisy mogą być przypięte naraz. Czwarte przypięcie pokazuje komunikat „Najwyżej 3 wpisy mogą być przypięte naraz. Odepnij jeden, żeby przypiąć ten.”, a wpis zostaje nieprzypięty.
- Serwer pod `/api/news/admin`: `POST /:id/pin` ustawia czas przypięcia, `POST /:id/unpin` go czyści. Przypięcie wpisu już przypiętego i odpięcie wpisu już odpiętego kończy się sukcesem, a szkic nie da się przypiąć (409). Trasy stoją za `requireNewsAuthor`, tak jak reszta panelu.
- Bez internetu przycisk przypinania jest nieaktywny, a objaśnienie brzmi „Publikacja, przypinanie i usuwanie wymagają internetu.”.

### Uwaga

- Schemat bazy bez zmian. Kolumna `pinnedAt` pochodzi z podtoru 3a (PR #118), dlatego ten PR zaczyna się od jego gałęzi.
- Limit liczy wszystkie wpisy z ustawionym `pinnedAt`, także zaplanowane na późniejszą godzinę (`publishAt` w przyszłości), bo to ich dotyczy przypięcie w bazie. Gdyby zespół chciał liczyć tylko widoczne, trzeba zmienić warunek w `worker/news/admin/queries.ts`.
- Gdy dwa przypięcia idą naraz i zostało jedno miejsce, wygrywa to, które trafi pierwsze do bazy, a drugie dostaje komunikat o limicie. Jeśli ktoś odepnie wpis w chwili między nieudanym zapisem a odczytem wyniku, przypięcie też dostanie komunikat o limicie mimo wolnego miejsca. Wystarczy ponowić, więc to akceptowalne.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | 3c, przypinanie wpisów (draft, część #118) | Podtor 3c: przycisk „Przypnij” / „Odepnij” w panelu, serwer ustawia `pinnedAt`, limit 3 w jednym warunkowym zapytaniu, testy Vitest i e2e. | Dodało trasy `pin` i `unpin` oraz warunkowy UPDATE z limitem w `worker/news/admin/queries.ts` i `routes.ts`, testy w `routes.test.ts`, klasę `PinLimitError`, funkcje i hooki w `api.ts` i `queries.ts`, przycisk w `EntryTile.tsx`, komunikaty w `NewsAdminScreen.tsx` i `texts.ts`, ikonę `pin` w `icons.tsx`, testy w `e2e/news-admin.spec.ts` oraz ten plik. | — | — |
