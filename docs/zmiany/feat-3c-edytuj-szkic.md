# Wpisy z pull requestów

## Changelog

### Dodane

- Przycisk „Edytuj” przy szkicu na liście wpisów w panelu Samorządu. Prowadzi do kreatora pod adresem `/news/editor/:id`. Wpis opublikowany tego przycisku nie ma.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #19, przycisk „Edytuj” w panelu (podtor 3c) | Dodać przy szkicu w panelu przycisk „Edytuj” prowadzący do kreatora z id szkicu, z testem e2e | Dodano link „Edytuj” w `EntryTile.tsx` tylko dla szkiców, tekst `edit` w `texts.ts`, ikonę ołówka w `icons.tsx` i test w `e2e/news-admin.spec.ts` | | |
