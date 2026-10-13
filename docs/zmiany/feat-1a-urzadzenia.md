## Changelog

### Dodane

- Ekran „Moje urządzenia” pod adresem `/auth/email/urzadzenia`: lista aktywnych sesji ucznia (przeglądarka i system z user-agenta, np. „Chrome na Android”), czas ostatniej aktywności i znacznik „To urządzenie” przy bieżącym urządzeniu.
- Wylogowanie jednego urządzenia z listy oraz przycisk „Wyloguj z innych urządzeń”. Oba działają przez wbudowane funkcje Better Auth (`list-sessions`, `revoke-session`, `revoke-other-sessions`), bez własnej logiki sesji.
- Trasy `GET /api/auth/email/devices`, `POST /api/auth/email/devices/revoke` i `POST /api/auth/email/devices/revoke-others` w `worker/auth/email/`. Odpowiedź nie zawiera tokenu sesji ani adresu IP; serwer szuka tokenu po `id` z listy.
- Komunikaty po polsku dla błędów urządzeń (`describeDeviceError` w `authMessages.ts`), w tym prośba o ponowne logowanie, gdy sesja jest stara.
- Testy: `worker/auth/email/devices.test.ts` (20 testów na prawdziwej bazie D1 testów), testy komunikatów w `authMessages.test.ts` i nowa grupa „moje urządzenia” w `e2e/auth-email.spec.ts`.

### Zmienione

- `SESSION_QUERY_KEY` w `useAuthSession.ts` jest teraz eksportowany, żeby ekran urządzeń mógł unieważnić sesję po błędzie.
- `AuthEmailScreen` obsługuje adres `/auth/email/urzadzenia`: niezalogowany wraca na logowanie, zalogowany widzi listę.

### Do decyzji

- Świeżość sesji: Better Auth domyślnie wymaga, żeby sesja miała mniej niż 24 h (`session.freshAge`, liczone od `createdAt`). Po tym czasie lista i wylogowanie jednego urządzenia dają 403 `session_not_fresh`, a uczeń widzi prośbę o ponowne logowanie. „Wyloguj z innych urządzeń” działa dalej. Zmiana `freshAge` to decyzja właściciela.
- Ostatnia aktywność jest przybliżona, bo Better Auth odświeża `updatedAt` około raz na dobę.
- Link do ekranu urządzeń z profilu ucznia nie jest w tym podtorze: należy do podtoru 7 (moje dane).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 1a, lista urządzeń i wylogowanie (#108) | Lista aktywnych sesji z user-agentem, wylogowanie jednego i wszystkich innych, wbudowane funkcje Better Auth, testy Vitest i e2e | Napisało `worker/auth/email/devices.ts` i `devices.test.ts`, zmieniło `worker/auth/email/routes.ts`, dodało `src/features/auth/email/DevicesScreen.tsx` i `devicesApi.ts`, zmieniło `AuthEmailScreen.tsx`, `authMessages.ts`, `authEmail.css`, `useAuthSession.ts`, `e2e/auth-email.spec.ts` | do uzupełnienia | do uzupełnienia |
