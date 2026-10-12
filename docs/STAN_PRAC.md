# Stan prac

Stan na 12.10.2026. `main` po scaleniu #61. Ten plik mówi, co jest zrobione, co jest następne i jak kontynuować w nowym wątku albo przez inną osobę. Aktualizuj go po każdej większej turze pracy.

## Co jest w `main`

| Podtor | Co | Pull request |
|---|---|---|
| etap A | szkielet, rejestracja wszystkich podtorów, adresy (ADR 0003), lista kasowania danych ucznia | #34 |
| 0 | PWA, baza D1 (`DB`, `db:reset`, `db:seed`), wspólny `QueryClient` z zapisem w telefonie, pasek „Brak internetu”, drzwi modułu auth | #33, #53, #54, #55 |
| 1a | logowanie kodem ze szkolnej poczty, `requireStudent` | #50 |
| 3a | aktualności: lista i wpis | #49 |
| 4a | zgłoszenie: formularz i „moje zgłoszenia” | #47 |
| 5a | ankieta: głosowanie | #48 |
| 0 | bramka logowania: odpowiedź 401 i wylogowanie przenoszą na `/auth/email` | #60 |
| 1b | kody zaproszeń, login i hasło | #62 |
| 7 | profil i ustawienia, usunięcie konta | #63 |
| 9 | pulpit: kafelki aktualności, zgłoszeń, ankiety i dzwonka | #61 |
| CI | Babel 8 razem, reguły Dependabota, uprawnienia workflow tylko do czytania | #56, #57 |

Testy na `main`: lint, Vitest, build i e2e w CI przechodzą. Alerty CodeQL: 0 otwartych. Otwartych pull requestów: 0.

## Co dalej

Zależności każdego podtoru są w `docs/PODZIAL_PRACY.md`, część 3. Zgłoszenia podtorów mają etykietę `tor:<podtor>`.

**Można zaczynać od razu** (zależności są w `main`):

- 8, panel Samorządu: rama, role, wydawanie kodów (#26). Najpierw `worker/auth/index.ts` musi wystawić `issueInviteCode` (podtor 1b).
- 3b, edytor wpisów (#18). Najpierw osobny pull request dodaje pakiety Tiptap (ADR 0002, opcja A przyjęta 9.10), bo agent podtoru nie dodaje pakietów.
- 4b, zgłoszenia w panelu (#21), i 5b, ankiety w panelu (#23). W `docs/projekt/EKRANY.md` nie ma ich ekranów, więc najpierw projekt z Szymonem.

**Czekają:**

- 3c (#19) czeka na 3b.
- 2, wysyłka zdjęć (#16, #45), czeka na konto Cloudflare.
- 6, dzwonek (#24), czeka na plan dzwonków od Kacpra (17.10).
- #51: zostało tylko prawdziwe wysyłanie maili (`send_email`), po założeniu konta Cloudflare i teście 20.10.

## Jak uruchomić agenta podtoru

1. Polecenie dla agenta jest w `docs/PODZIAL_PRACY.md`, część 9. Wstaw podtor, port i numer zgłoszenia.
2. Każdy agent ma swoją kopię: `git worktree add ../teb-<podtor> -b feat/<podtor>-<krótko> origin/main`.
3. Najwyżej 4 pull requesty naraz gotowe do przeglądu. Reszta jako szkic.
4. Agent nie scala. Scala Szymon (albo osoba prowadząca rój), dopiero gdy wszystkie sprawdzenia na ostatnim commicie są zielone.

## Jak scalać

`main` wymaga gałęzi aktualnej względem `main` i jednego zatwierdzenia. Po każdym scaleniu kolejny pull request trzeba więc odświeżyć:

```bash
gh pr update-branch <numer>
gh pr checks <numer> --watch
gh pr merge <numer> --merge --admin
```

Po scaleniu usuń kopię roboczą (`git worktree remove ../teb-<podtor>`) i gałąź.

## Na co uważać

- Skrypty `db:reset` i `db:seed` potrzebują Node 22.18 albo nowszego. Kasują `.wrangler/state/v3/d1`, więc najpierw zatrzymaj `npm run dev`.
- Logowanie lokalnie działa na porcie z `BETTER_AUTH_URL` w `.dev.vars` (wzór: `.dev.vars.example`, port 5173). Na innym porcie serwer odpowiada 403.
- Agent zatrzymuje tylko proces na swoim porcie (`lsof -ti tcp:<port> | xargs kill`), nigdy `pkill -f vite`.
- Playwright w CI ma swoją przeglądarkę. Lokalnie agenci uruchamiali e2e przez systemowy Chrome.
- Test serwera zgłoszeń (4a) importuje `worker/auth/email/testRuntime.ts` wprost, z pominięciem drzwi modułu. Działa, ale przy porządkach warto wystawić pomocnika testowego przez drzwi auth.
- Gdy agenci trafią na limit API, ich zmiany zostają na dysku w `../teb-<podtor>`. Po odnowieniu limitu wznów tego samego agenta albo daj nowemu agentowi ten katalog.

- Plik `.dev.vars` psuje lokalnie testy Workera z sesją (401, bo `BETTER_AUTH_URL` nie pasuje do adresu testu). CI go nie ma. Lokalnie uruchamiaj Vitest bez `.dev.vars`.
- Podtor 1b wymaga `BETTER_AUTH_SECRET` także lokalnie (bez niego 503). Seed nie ma kodu zaproszenia.
- Usuwanie danych z modułów aktualności, mediów i panelu to na razie puste atrapy (`deleteNewsStudentData`, `deleteMediaStudentData`, `deleteAdminStudentData`). Podtory 2, 3b, 3c i 8 muszą je wypełnić.
- `index.ts` modułów 3a, 4a i 5a nie wystawiają typów ani funkcji pobierania, więc pulpit czyta ich odpowiedzi HTTP. Moduł logowania nie wystawia imienia ucznia.

## Decyzje do podjęcia

- **Bohdan:** ADR 0003 (adresy podtorów), 0004 (przeglądarki), 0005 (krój pisma).
- **Adam:** czy wyłączyć wymóg aktualnej gałęzi przed scaleniem. Przez niego każde scalenie czeka na CI dwa razy.
- **Zespół:** teksty, których nie ma w `docs/projekt/EKRANY.md`: ekrany logowania, aktualności, zgłoszeń i ankiet, pasek „Brak internetu”. Parametry logowania: 3 próby kodu, 3 wysyłki na minutę, sesja 7 dni.
- **Zespół:** teksty z pull requestów #61, #62 i #63 oznaczone „do ustalenia” (logowanie loginem, ustawienia, puste stany pulpitu). Sprzeczność: `EKRANY.md` 2.4 mówi „Usuniemy zgłoszenia i odpowiedzi.”, a plan mówi, że zgłoszenia zostają bez autora.
- **Bohdan:** czas hashowania hasła (scrypt) w Workerze, podtor 1b.
- **Zespół:** PWA: pasek „Jest nowa wersja”, krótka nazwa aplikacji, ikona technikum.
- **Wszyscy:** loginy GitHub w `docs/OWNERS.md`. Bez nich nie ma pliku CODEOWNERS.
- **Szymon:** przenieść wpisy z `docs/zmiany/` do `CHANGELOG.md` i `docs/LOG_AI.md`.
