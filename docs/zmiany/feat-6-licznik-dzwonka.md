## Changelog

### Dodane

- Licznik do dzwonka na ekranie podtoru 6: w czasie lekcji pokazuje minuty do dzwonka, w przerwie minuty do następnej lekcji. Poza lekcjami, przed pierwszą i po ostatniej lekcji oraz w weekend nic się nie pokazuje. Działa offline, bez dźwięku, liczy według czasu warszawskiego.
- Plan dzwonków to dane w `src/features/bell/bellPlan.ts`. Jest pusty, więc licznik się nie pokazuje, dopóki plan nie zostanie uzupełniony.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #24, podtor 6: licznik do dzwonka | Zrób licznik do dzwonka w `src/features/bell/`: plan jako dane (pusty w main), czas w strefie Europe/Warsaw, testy logiki na przykładowym planie, teksty z makiety EKRANY 2.1. | Dodało `bellPlan.ts` (typ lekcji i pusty plan), `bellState.ts` (logika czasu, zmiana czasu przez Intl), `BellCountdown.tsx` i `bell.css` (komponent), `BellScreen.tsx` i `index.ts` (ekran i eksport), testy Vitest (`bellState.test.ts`, `BellCountdown.test.tsx`) i `e2e/bell.spec.ts`. | do uzupełnienia | Kacper |
