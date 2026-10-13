## Changelog

### Dodane

- Licznik do dzwonka pokazuje też następną lekcję: w czasie lekcji dodatkowy wiersz „Następna: lekcja N o H:MM”, a w przerwie etykietę „Przerwa, do lekcji N”. Po ostatniej lekcji dnia następnej lekcji nie ma, więc wiersza nie ma.
- Napisy „Przerwa, do lekcji N” i „Następna: lekcja N o H:MM” nie są w makiecie EKRANY 2.1, do potwierdzenia w PR.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #103, podtor 6: następna lekcja i przerwa w liczniku | Licznik ma pokazywać też następną lekcję i przerwę. Logika w `bellState.ts` z testami Vitest (lekcja, przerwa, przed pierwszą, po ostatniej, weekend, pusty plan), plan PRZYKŁADOWY tylko w testach, `bellPlan.ts` bez zmian. Pokazać w `BellCountdown`. Bez dźwięku. Dodatkowo: stan licznika dla pulpitu z `index.ts`. | Dodało pole `next` w `BellState` i funkcję `nextLessonAfter` (`bellState.ts`), etykietę „Przerwa, do lekcji N” i wiersz „Następna” (`BellCountdown.tsx`), styl `.bell-countdown__next` (`bell.css`), funkcję `currentBellState` (`index.ts`), testy w `bellState.test.ts`, `BellCountdown.test.tsx`, `index.test.ts` i asercje w `e2e/bell.spec.ts`. | do uzupełnienia | Szymon Sosnowski |
