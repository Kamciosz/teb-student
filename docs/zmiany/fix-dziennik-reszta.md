## Changelog

### Poprawione

- Usunięcie wpisu newsa, zmiana etapu zgłoszenia, nadanie i odebranie roli w panelu oraz wydanie kodu zaproszenia zapisują się razem z wpisem w dzienniku zmian: wszystko idzie w jednym batchu D1 (jednej transakcji). Gdy zapis do dziennika się nie uda, zmiana też się nie zapisze.
- Wpis w dzienniku powstaje tylko przy realnej zmianie: usunięcie istniejącego wpisu, zmiana na inny etap, nadanie roli, której nie było, odebranie roli, którą było. Powtórne kliknięcie tego samego nie dopisuje wpisu.
- Zmiana etapu zgłoszenia sprawdza stan sprzed zmiany w tym samym batchu, więc wpis i zmiana widzą to samo zgłoszenie.
- Usunięte nieużywane funkcje `grantPanelRole` i `revokePanelRole` z `worker/admin/panelRoles.ts` (zastąpione wersjami `...Query` używanymi w batchach).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Atomowość pozostałych zapisów do dziennika (gałąź fix/dziennik-reszta) | Zapisać wpis w `diary_entries` razem ze zmianą dla usunięcia newsa, zmiany etapu zgłoszenia, nadania i odebrania roli oraz wydania kodu zaproszenia, przez `orm.batch`; wpis tylko przy realnej zmianie; test z zablokowanym dziennikiem dla każdej akcji. | Zmieniono worker/news/admin/queries.ts (deleteEntry na batch), worker/news/admin/routes.ts (usunięty osobny zapis do dziennika), worker/reports/admin/reportsAdminRepository.ts (zmiana etapu w batchu z warunkowym wpisem), worker/reports/admin/routes.ts (usunięty osobny zapis), worker/admin/roleRoutes.ts i worker/admin/panelRoles.ts (nadanie i odebranie roli w batchu, usunięte nieużywane funkcje), worker/admin/routes.ts (wydanie kodu w batchu), worker/auth/invite/inviteCodes.ts (prepareInviteCode zwraca zapytanie), worker/admin/diary.ts, worker/admin/index.ts, testy w worker/admin/roles.test.ts, worker/admin/routes.test.ts, worker/news/admin/routes.test.ts, worker/reports/admin/routes.test.ts. | do uzupełnienia | do uzupełnienia |
