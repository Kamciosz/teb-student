## Changelog

### Zmienione

- Test eksportu zgłoszeń ucznia (`worker/reports/listMyReports.test.ts`) oczekuje teraz pola `history`. Od #113 każde zgłoszenie na liście ucznia ma historię etapów z odpowiedzią Samorządu, bez numeru członka Samorządu. Test z #109 powstał wcześniej i sprawdzał stary zestaw pól, więc CI na `main` padało od scalenia #113. Asercja nadal sprawdza dokładny zestaw pól i pełną treść pierwszego zgłoszenia.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | test pól listy zgłoszeń po #113 (`build/test-historii-zgloszen`) | Napraw czerwone CI na `main` po scaleniu #113. | Dopisało pole `history` z danymi z seeda w `worker/reports/listMyReports.test.ts` i ten plik. | | |
