## Changelog

### Dodane

- Pod wpisem widać podpis autora („Autor: imię nazwisko”), gdy wpis ma autora, oraz stopkę „Redakcja gazetki”. Teksty stopki są do potwierdzenia przez TO_AGREE.
- Wpis niesie kolumnę `author_user_id` (konto autora, puste gdy brak autora). Feed zwraca tylko imię i nazwisko autora, bez adresu e-mail.

### Zmienione

- Usunięcie konta ustawia `author_user_id` na pusty, a wpis zostaje (`deleteNewsStudentData`).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3a: podpis autora i stopka redakcji (draft) | Dodaj kolumnę `author_user_id` z kluczem do konta (puste przy usunięciu konta), zwróć imię autora w wpisie bez e-maila, pokaż podpis i stopkę „Redakcja gazetki”, ustaw autora w dwóch wpisach seed, dopisz testy i przypadek e2e. | Zmieniło `worker/db/schema/news.ts`, `worker/news/feed/queries.ts`, `worker/news/feed/routes.ts`, `worker/news/feed/deleteStudentData.ts`, `worker/db/seed/news.ts`, `src/features/news/feed/EntryScreen.tsx`, `src/features/news/feed/EntrySignature.tsx`, `src/features/news/feed/types.ts`, `src/features/news/feed/feed.css`, testy w `worker/news/feed/` i `src/features/news/feed/`, `e2e/news-feed.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
