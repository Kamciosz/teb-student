## Changelog

### Zmienione

- Ekrany logowania (adres e-mail, kod z maila, kod zaproszenia, logowanie loginem) i ekran „Moje urządzenia” mają wygląd aplikacji systemowej: nagłówek `ScreenHeader`, jedno pole, jeden wypełniony przycisk, przycisk passkey jako tekst, kolumna do 420 px. Wzór: `docs/projekt/wyglad-ekranow.md`.
- Błędy logowania są w kolorze ostrzegawczym i mają `role="alert"`, a kod z maila ma podpowiedź klawiatury numerycznej.

### Usunięte

- Nieużywane komponenty i style starego wyglądu logowania (`InviteField`, ikony w obu podtorach, martwe klasy CSS).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | style(logowanie): ekrany logowania w wyglądzie systemowym | Przerób ekrany logowania (podtory 1a i 1b) oraz „Moje urządzenia” zgodnie z `docs/projekt/wyglad-ekranow.md`, bez zmiany tekstów i logiki. | Zmieniło `src/features/auth/email/*` (EmailStep, CodeStep, PasskeySignIn, DevicesScreen, authEmail.css i test passkey), `src/features/auth/invite/*` (SignUpForm, SignInForm, AuthInviteScreen, inviteMessages.ts, authInvite.css), `e2e/auth-invite.spec.ts` (nazwa linku „Wstecz”) oraz usunęło nieużywane `InviteField.tsx` i `icons.tsx` w obu podtorach. Dodało ten plik. | — | Szymon |
