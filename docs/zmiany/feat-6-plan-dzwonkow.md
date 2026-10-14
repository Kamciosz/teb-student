## Changelog

### Dodane

- Plan dzwonków szkoły: 13 lekcji od 7:10 do 18:20, od poniedziałku do piątku. Lekcje są numerowane od 0 (lekcja 0 kończy się o 7:55, lekcja 12 o 18:20).

### Zmienione

- Licznik do dzwonka i napisy „Następna: lekcja …” oraz „Przerwa, do lekcji …” liczą lekcje od 0 zamiast od 1.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | podtor 6, plan dzwonków | Wpisz prawdziwy plan dzwonków szkoły (13 lekcji 0–12), przejdź na numerację od 0, zaktualizuj testy. | Zmieniono `src/features/bell/bellPlan.ts` (godziny lekcji), `bellState.ts` (numery od 0), testy w `src/features/bell/` i `e2e/bell.spec.ts`. Dodano ten plik. Skrócony plan zostaje pusty (do uzgodnienia). | … | Szymon |
