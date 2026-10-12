## Changelog

### Dodane

- Role w panelu Samorządu: redakcja gazetki (tylko Wpisy), Samorząd (Wpisy, Zgłoszenia, Ankiety, Kody zaproszeń) i administrator (wszystko). Tabela `panel_roles` i dane testowe (`seed-user-1` to administrator, `seed-user-2` ma rolę redakcji).
- Sprawdzanie roli dla routerów innych modułów: `requirePanelRole('editor' | 'council' | 'admin')` z `worker/admin/index.ts`. Bez sesji odpowiada 401, bez wystarczającej roli 403.
- Bramka roli `PanelGate` na ekranach panelu (eksportowana z `src/features/admin/index.ts`). Uczeń bez roli widzi ekran 6.1d „Tylko dla Samorządu”, a redakcja tylko Wpisy i ekran główny panelu.
- Ekran główny panelu (6.1b, 6.1c): podpis roli i wiersze części panelu, które widzi ta rola.
- Kody zaproszeń (6.2): przycisk „Wydaj kod” (kod ważny 14 dni), kafel „Nowy kod” z datą końca i kopiowaniem. Bez internetu przycisk jest nieaktywny. `POST /api/admin/invites` wywołuje `issueInviteCode` z modułu logowania.
- `GET /api/admin/me` oddaje rolę ucznia. `usePanelEntry` z `src/features/admin/index.ts` daje profilowi wiersz „Panel Samorządu” albo „Panel redakcji” ze znacznikiem (ekran 6.1a).
- Kasowanie ról ucznia przy usunięciu konta (`deleteAdminStudentData`).

### Zmienione

- Menu panelu zostaje w ramie, bo `e2e/news-admin.spec.ts` (podtor 3c) oczekuje go bez sesji. Bramka roli jest więc na ekranach, nie w ramie.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | #26, podtor 8: panel Samorządu, rama, role i kody | Zbuduj ramę panelu, role i wydawanie kodów zaproszeń według ekranów 6.x, wystaw sprawdzanie roli dla podtorów 3c, 4b i 5b; z testami. | Dodało tabelę ról i dane testowe (`worker/db/schema/admin.ts`, `worker/db/seed/admin.ts`), serwer w `worker/admin/` (sprawdzanie roli, router, kasowanie danych), ekrany w `src/features/admin/`, testy Vitest, test Playwright `e2e/admin.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
