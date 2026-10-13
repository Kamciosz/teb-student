## Changelog

### Dodane

- Lista „Wydane wcześniej” na ekranie kodów zaproszeń (6.2b) z kodami, które nadal działają, albo pusty stan. Nad przyciskiem „Wydaj kod” stoi „Wydanie kodu wymaga internetu.”, gdy nie ma połączenia.
- Role (6.3a, 6.3d): ekran „Role” tylko dla administratora. Wyszukiwanie po szkolnym adresie (dokładne dopasowanie), komunikaty dla adresu spoza szkoły („Wpisz adres, który kończy się na @teb.edu.pl.”) i dla braku konta („Nie ma konta z tym adresem.”), lista osób z rolą z zamaskowanym adresem.
- Karta roli (6.3b, 6.3c): przełączniki „Samorząd” i „Redakcja gazetki”, znacznik „Zmiana” przy różnicy wobec zapisanego stanu, przycisk „Zapisz role”. Odebranie roli Samorządu otwiera arkusz „Odebrać rolę Samorządu?”; nadanie nie wymaga potwierdzenia.
- Zapis ról: `PUT /api/admin/roles/:studentId` przyjmuje tylko pola `council` i `editor` (booleany). Inne pola albo złe typy dają 400. Zapis nie zmienia roli administratora, dla nikogo (test).
- Szukanie i lista ról: `GET /api/admin/roles/search?email=` i `GET /api/admin/roles`. Odpowiedź zawiera zamaskowany adres (`a***@teb.edu.pl`), nie pełny.
- Dane z pilotażu (6.1e): ekran „Dane z pilotażu” i `GET /api/admin/pilot`. Plik CSV `pilotaz.csv` z trzema liczbami: zalogowania, zgłoszenia, odpowiedzi z ankiet. Bez imion, nazwisk i adresów. Plik ma znak BOM i końce linii CRLF.
- Ekran główny panelu (6.1b, 6.1c): pod etykietą „Pilotaż” wiersze „Role” (ikona `users`, odznaka „Administrator”) i „Dane z pilotażu” (ikona `download`), tylko dla administratora.
- Testy: `worker/admin/roles.test.ts`, `worker/admin/pilot.test.ts`, rozszerzony `e2e/admin.spec.ts` (testy podtoru 8, w tym przy szerokości 320 px).

### Zmienione

- `worker/admin/index.ts`: `requirePanelRole` jest eksportowane przed `adminApp`. Wcześniejsza kolejność tworzyła cykl importów z `worker/reports/admin/routes.ts` i kończyła się błędem „requirePanelRole is not a function”.
- Pliki ekranów panelu i testy e2e zostały podzielone na mniejsze funkcje (limit 40 linii na funkcję z `docs/STANDARD_KODU.md`), bez zmiany zachowania.

## Otwarte

- Zapis ról nie ma komunikatu o braku internetu, bo 6.3b go nie zawiera. Jest tylko nieaktywny przycisk.
- Brak tekstu dla błędu wyszukiwania i błędu ładowania karty. Tekst nie został wymyślony.
- Lista osób z rolą nie pokazuje klasy („3TA”, „2LA”), bo serwer nie zwraca tej danej w `StudentSummary`.
- Adres wpisany w wyszukiwaniu jedzie tylko w stanie trasy. Po przeładowaniu strony pole jest puste.
- Format pliku pilotażu (CSV albo inny) i dokładna lista liczb czekają na decyzję Jakuba (EKRANY.md).
- `e2e/admin.spec.ts` ma 485 linii, czyli ponad limit 300 z `docs/STANDARD_KODU.md`. Granice torów dopuszczają tylko ten plik, więc pomocniki nie zostały wydzielone do osobnego pliku.
- Testy serwera ról i pilotażu powstały po kodzie serwera. Sprawdzono je mutacjami: usunięcie bramki roli i zmiana pola w pliku pilotażu powodują nieprzejście testów.
- Jeden przebieg e2e padł w 14 testach po około 1,1 s każdy. Nie udało się tego odtworzyć: samodzielny przebieg i kolejny pełny przebieg przeszły 20/20.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #26, podtor 8: kody zaproszeń, role i pilotaż | Dokończ ekrany 6.2a–b, 6.3a–d i 6.1e oraz wiersze na ekranie głównym według docs/projekt/EKRANY.md, bez zmiany treści; testy serwera i e2e z 320 px; bez nowych pakietów. | Dodało ekrany `src/features/admin/` (`InvitesScreen`, `InviteList`, `CopyCodeButton`, `RoleScreen`, `RoleCardScreen`, `PilotScreen`), trasy `worker/admin/roleRoutes.ts` i `worker/admin/pilotRoutes.ts`, `worker/admin/maskEmail.ts`, `worker/admin/testSession.ts`, testy `worker/admin/roles.test.ts`, `worker/admin/pilot.test.ts`, rozszerzenie `e2e/admin.spec.ts` oraz ten plik. Zmieniło `worker/admin/index.ts` (kolejność eksportu). | do uzupełnienia | do uzupełnienia |
