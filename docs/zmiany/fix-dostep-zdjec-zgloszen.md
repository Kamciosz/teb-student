## Changelog

### Naprawione

- Zdjęcie dołączone do zgłoszenia widzi tylko jego autor i administracja (Samorząd). Inny uczeń dostaje odpowiedź „nie znaleziono”, taką samą jak za brakujący plik. Pozostałe zdjęcia i filmy działają jak wcześniej.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | Dostęp do zdjęć zgłoszeń, gałąź fix/dostep-zdjec-zgloszen | Ograniczyć zdjęcie zgłoszenia do autora i administracji w GET /api/media/:id i /:id/meta, dodać testy, zapisać decyzję w STAN_PRAC. | Dodano isReportPhoto (worker/reports/student/isReportPhoto.ts, eksport przez drzwi reports) i strażnika guardReportPhoto (worker/media/guardReportPhoto.ts), podpiętego po requireStudent w worker/media/routes.ts. Rozszerzono routes.test.ts o cztery przypadki. Zmieniono docs/STAN_PRAC.md. | – | Szymon |
