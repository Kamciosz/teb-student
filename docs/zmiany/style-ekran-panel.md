## Changelog

### Zmienione

- Panel Samorządu ma systemowy wygląd: ekran główny to lista z sekcjami zamiast kafli, a podekrany mają nagłówek z przyciskiem „Wstecz”.
- Role, kody zaproszeń i dziennik zmian są w grupowanych listach, a przełączniki ról stoją w wierszach.
- Formularze mają pole w grupie i jeden główny przycisk na dole ekranu. Odebranie roli Samorządu jest oznaczone jako czynność destrukcyjna.
- Z ekranu głównego panelu zniknął link „Wróć do profilu”.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | Panel Samorządu w systemowym wyglądzie, pull request z gałęzi `style/ekran-panel` | Przerobić panel Samorządu w `src/features/admin/` na wygląd z `docs/projekt/wyglad-ekranow.md`: nagłówki `ScreenHeader`, listy `ListGroup`/`ListRow`, formularze z `TextField` i jednym przyciskiem, akcje destrukcyjne. `ScreenTop.tsx` zastąpić i usunąć. Logika i uprawnienia bez zmian. Sprawdzić lint, testy, build i e2e. Zapisać wpis w `docs/zmiany/`. | Przepisało ekrany panelu (`PanelHome`, `RoleScreen`, `RoleCardScreen`, `DiaryScreen`, `InvitesScreen`, `InviteList`, `CopyCodeButton`, `PilotScreen`, `NoAccessScreen`), `admin.css` (usunięte nieużywane klasy, dodany `.ad-pager`), `icons.tsx` (usunięty wpis `@used_by` po `ScreenTop`). Usunęło `ScreenTop.tsx`. Zmieniło `e2e/admin.spec.ts` (selektory na `.ui-list-group .ui-list-row`). Dodało ten plik. | — | Szymon |
