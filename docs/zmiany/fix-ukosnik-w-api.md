## Changelog

### Naprawione

- Lista ankiet ucznia i lista ankiet w panelu działają po zbudowaniu. Ekrany pytały o adres z ukośnikiem na końcu, a serwer odpowiadał 404.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Jak sprawdzono |
|---|---|---|---|---|---|
| 2026-11-01 | Ukośnik w adresach API (gałąź fix/ukosnik-w-api) | Poprawiać od razu to, co jest do poprawy | Włączyło `strict: false` w `worker/index.ts` i dodało test w `worker/index.test.ts` | Nic | Test padał przed zmianą i przechodzi po niej; obchód wszystkich ekranów w zbudowanej aplikacji |
