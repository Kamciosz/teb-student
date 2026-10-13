## Changelog

### Zmienione

- Licznik do dzwonka na pulpicie prowadzi do ekranu „Licznik do dzwonka” (`/bell`). Plan dzwonków jest nadal pusty, więc pulpit pokazuje pusty stan „Brak planu dzwonków”. Pulpit nie pokaże minut, dopóki moduł dzwonka nie wystawi planu (patrz „Otwarte” w PR).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 9: kafelek dzwonka (PR do uzupełnienia) | Podepnij licznik z `src/features/bell/index.ts` do pulpitu, pusty stan przy pustym planie, kafelek prowadzi do `/bell`, testy kafelka i e2e pulpitu. | Zmieniło `DashboardHeader.tsx` (licznik jest linkiem do `/bell`), `dashboard.css` (styl linku), `tiles.test.tsx` (adres linku) i `e2e/dashboard.spec.ts` (kafelek prowadzi do `/bell`), oraz dodało ten plik. Nie podpięło minut: `bell/index.ts` nie wystawia planu. | do uzupełnienia | Szymon |
