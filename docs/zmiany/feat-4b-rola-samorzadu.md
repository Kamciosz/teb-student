## Changelog

### Zmienione

- Zgłoszenia w panelu Samorządu działają naprawdę: serwer (`/api/reports/admin`) wpuszcza osobę z rolą Samorządu albo administratora (`requirePanelRole('council')` z podtoru 8). Bez sesji odpowiada 401, bez roli i z rolą redakcji 403.
- Ekran zgłoszeń stoi za bramką `PanelGate`: uczeń bez roli albo członek redakcji widzi „Tylko dla Samorządu” i telefon nie pobiera zgłoszeń.

### Usunięte

- Zaślepka `worker/reports/admin/councilGuard.ts`, która odmawiała każdemu, oraz parametr strażnika w routerze.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | podtor 4b: rola Samorządu zamiast zaślepki | Podmień `denyCouncilGuard` na `requirePanelRole('council')`, usuń zaślepkę, popraw testy, ekran za `PanelGate`. | Zmieniło `worker/reports/admin/routes.ts`, `testDatabase.ts` i `routes.test.ts` (produkcyjny router, role w bazie), usunęło `councilGuard.ts`, owinęło ekran w `PanelGate` i dopisało podstawkę roli oraz testy bramki w `e2e/reports-admin.spec.ts`. | do uzupełnienia | do uzupełnienia |
