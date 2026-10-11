## Changelog

### Naprawione

- Bramka logowania w telefonie: gdy serwer odpowiada 401 (uczeń bez sesji lub z wygasłą sesją), aplikacja przenosi na `/auth/email` zamiast pokazywać błąd o braku internetu (ankiety) albo błąd wysyłania (zgłoszenia). Dotyczy wszystkich adresów `/api/…` poza logowaniem, więc nowe moduły dostają to bez własnego kodu.
- Po wylogowaniu aplikacja też przenosi na `/auth/email` i ładuje się od nowa, więc otwarty ekran nie zostaje w starym stanie.
- Po 401 telefon czyści zapisane dane poprzedniego ucznia.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-11 | #58, podtor 0: bramka logowania, 401 prowadzi do /auth/email | Jedno wspólne miejsce w `src/shared` przenosi na `/auth/email` po 401 i po wylogowaniu, bez obsługi w ekranach modułów | Dodało `src/shared/auth/signInGate.ts` (otoczka na `fetch`) i `redirectToSignIn.ts`, podłączyło bramkę w `AppQueryProvider.tsx`, a `clearQueryData.ts` kończy przeniesieniem na logowanie. Testy: `signInGate.test.ts`, `persistence.test.ts`, `e2e/shared-bramka.spec.ts` | do uzupełnienia | Szymon |
