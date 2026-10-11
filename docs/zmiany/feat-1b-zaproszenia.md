## Changelog

### Dodane

- Konto z kodem zaproszenia: uczeń wpisuje kod od Samorządu (`TEB-XXXX-XX`, ważny 14 dni, działa raz), wymyśla login i hasło i od razu jest zalogowany. Ekran 1.3 pod adresem `/auth/invite`.
- Logowanie loginem i hasłem (login bez rozróżniania wielkości liter) na tym samym ekranie, pod przyciskiem „Mam już konto”. Sesja zapisana w ciasteczku działa też w logowaniu kodem z maila (`requireStudent`, `useAuthSession`), więc po zamknięciu i otwarciu aplikacji uczeń nadal jest zalogowany.
- Dla panelu Samorządu (podtor 8): funkcja `issueInviteCode(env.DB)` w `worker/auth/invite/` tworzy kod ważny 14 dni.
- Kody zaproszeń leżą w tabeli `verification` (identyfikator `invite-code-<kod>`), więc schemat bazy się nie zmienia. Konto z loginem ma w `user.email` adres techniczny `<login>@login.invalid`.
- Ochrona: kod zużywa się jednym zapytaniem (dwie próby naraz nie zużyją go dwa razy), zajęty login nie zużywa kodu, surowy adres rejestracji Better Auth jest ukryty, a limit 3 prób na 10 sekund z jednego adresu IP chroni przed zgadywaniem kodów i haseł.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-11 | #15, podtor 1b: kody zaproszeń, login i hasło | Zbuduj konto kodem zaproszenia z loginem i hasłem oraz logowanie nim, z sesją wspólną z podtorem 1a, z testami. | Dodało serwer w `worker/auth/invite/` (router, Better Auth z hakiem zużywającym kod, kody w `verification`, reguły loginu, pomocnik testowy), ekran w `src/features/auth/invite/` (formularze, komunikaty, style, ikony), testy Vitest, test Playwright `e2e/auth-invite.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
