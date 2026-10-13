## Changelog

### Dodane

- Przypięte wpisy są na górze listy aktualności, z odznaką „Przypięte” na kaflu. Najnowsze przypięcie jest pierwsze, potem wpisy od najnowszej publikacji.
- Wpis zaplanowany na późniejszą godzinę nie jest widoczny dla ucznia, także w wyszukiwaniu i pod własnym adresem.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | 3a, przypięte i godzina publikacji | Podtor 3a: pola `pinnedAt` i `publishAt`, sortowanie przypiętych, odznaka, testy (Vitest, e2e). | Dodało pola w `worker/db/schema/news.ts`, przepisało `worker/news/feed/queries.ts` (widoczność, sortowanie, szukanie przez `instr`), dodało `pinned` w `routes.ts` i `types.ts`, odznakę w `EntryCard.tsx`, styl w `feed.css`, testy i `e2e/news-feed.spec.ts`. | — | — |
