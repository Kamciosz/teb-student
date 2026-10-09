# Podział pracy między agentów

Cel: 10 i więcej agentów AI pracuje naraz, każdy w swoim module, i nie psuje pracy innych. Ten dokument mówi, kto rusza które pliki, w jakiej kolejności i co robić przy konflikcie.

Stan na 9.10.2026: kodu jeszcze nie ma. Ścieżki w tym dokumencie są planowane i jeszcze nie istnieją. Nazwy katalogów to propozycja do zatwierdzenia przez Bohdana w projekcie technicznym. Gdy Bohdan zmieni nazwę, zmieniamy ją tutaj, a zasady zostają.

## 1. Zasada główna

Aplikację dzielimy na **tory**. Tor to jeden moduł i jego pliki. Duży moduł dzielimy na **podtory**, na przykład osobno ekran ucznia i osobno ekran panelu. W podtorze pracuje jeden agent naraz, a jego pull requesty wchodzą po kolei. Różne podtory pracują równolegle, więc naraz może pracować 15 agentów.

Agent zmienia tylko pliki swojego podtoru i swój plik w `docs/zmiany/`. Każdy inny plik należy do kogoś innego.

## 2. Gdzie agenci by się zderzyli i jak tego unikamy

| Miejsce zderzenia | Co by się stało | Jak unikamy |
|---|---|---|
| Lista ekranów (router), lista adresów serwera, dolny pasek, menu panelu | każdy agent dopisuje swoją linię w tym samym miejscu | Etap A wpisuje tam od razu wszystkie moduły z części 3. Każdy wpis prowadzi do `index.ts` modułu, który na początku pokazuje „W budowie”. Agent modułu tych plików nie zmienia. |
| `package.json` i `package-lock.json` | dwie gałęzie dodają pakiety i plik blokady się nie scala | Etap A instaluje wszystkie pakiety z `docs/TECHNOLOGIE.md`. Agent modułu nie dodaje pakietów. Gdy pakietu brakuje, agent pyta Bohdana, a pakiet wchodzi osobnym pull requestem. |
| Schemat bazy | wszyscy zmieniają jeden plik | Każdy moduł ma swój plik schematu. Plik, który je zbiera, tworzy etap A i nikt go potem nie zmienia. Tak samo dane testowe: jeden plik na moduł. |
| `CHANGELOG.md` i `docs/LOG_AI.md` | każdy pull request dopisuje linię na końcu, więc gałęzie się kłócą | Agent nie zmienia tych plików. Pisze jeden plik `docs/zmiany/<gałąź>.md`. Szymon przenosi wpisy do `CHANGELOG.md` i `docs/LOG_AI.md`. Szczegóły: `docs/zmiany/README.md`. |
| Panel Samorządu | panel rusza wpisy, zgłoszenia, ankiety i konta | Ekran panelu dla danego modułu leży w katalogu tego modułu. Tor panelu robi tylko ramę panelu, kody zaproszeń i nadawanie ról. |
| Pulpit | pulpit pokazuje dane z czterech modułów | Pulpit bierze dane tylko z `index.ts` innych modułów. Nie zagląda do ich plików ani tabel. |
| Wysyłka zdjęć | potrzebują jej aktualności, a w rozbudowie też zgłoszenia | Wysyłka zdjęć i filmów to osobny tor. Inne moduły używają jej przez `index.ts`. |
| Usunięcie konta | profil kasuje dane z wielu modułów | Każdy moduł z danymi ucznia daje w swoim `index.ts` funkcję, która kasuje te dane. Listę tych funkcji tworzy etap A, a profil ją wywołuje. |
| Wspólne elementy ekranów (`src/shared/`) | dwa moduły zmieniają ten sam przycisk | Wspólne elementy robi etap A. Potem zmienia je tylko podtor 0, jeden pull request naraz. Agent modułu, któremu czegoś brakuje, zakłada zgłoszenie na GitHubie. |
| Serwer na komputerze | dwóch agentów uruchamia aplikację na tym samym porcie | Każdy podtor ma swój port (część 3). Serwer i testy Playwright biorą go ze zmiennej `PORT`. |
| Lokalna baza | dwóch agentów nadpisuje sobie dane | Każdy agent pracuje w osobnej kopii repozytorium (`git worktree`), więc ma osobną bazę w swoim katalogu `.wrangler`. |
| `index.ts` modułu podzielonego na podtory | dwa podtory dopisują eksport w tym samym pliku | Każdy podtor ma swój `index.ts` w swoim podkatalogu. `index.ts` modułu tylko je zbiera. Tworzy go etap A i nikt go potem nie zmienia. |
| Schemat bazy modułu podzielonego na podtory | dwa podtory zmieniają te same tabele | Schemat modułu należy do pierwszego podtoru (litera „a”). Inny podtor, który potrzebuje zmiany w tabeli, zakłada zgłoszenie dla podtoru „a”. |

## 3. Tory i podtory

Właściciel z `docs/OWNERS.md`. Port to port serwera na komputerze agenta. Podkatalog to katalog wewnątrz katalogu modułu.

| Podtor | Moduł i część | Katalog (propozycja) | Właściciel | Port | Na co czeka |
|---|---|---|---|---|---|
| 0 | wspólne: wygląd, układ, elementy ekranów | `src/shared/`, `worker/shared/` | Bohdan (technika), Kacper (wygląd) | 5170 | nie działa równolegle sam ze sobą |
| 1a | logowanie kodem z maila | `auth/email` | do ustalenia | 5171 | prawdziwe maile czekają na konto Cloudflare i test 20.10. Do tego czasu kod pokazuje terminal. |
| 1b | kody zaproszeń, login i hasło | `auth/invite` | do ustalenia | 5172 | tabele kont z podtoru 1a |
| 2 | wysyłka zdjęć i filmów | `media` | do ustalenia | 5173 | Cloudflare Images na adresie testowym potrzebuje konta Cloudflare |
| 3a | aktualności: lista i wpis | `news/feed` | do ustalenia | 5174 | zdjęcia we wpisach czekają na podtor 2. Tekst może iść od razu. |
| 3b | edytor wpisów | `news/editor` | do ustalenia | 5175 | decyzja Bohdana o bibliotece edytora (`docs/adr/`) |
| 3c | wpisy w panelu: publikacja, usuwanie | `news/admin` | do ustalenia | 5176 | edytor z podtoru 3b |
| 4a | zgłoszenie: formularz i „moje zgłoszenia” | `reports/student` | do ustalenia | 5177 | — |
| 4b | zgłoszenia w panelu: zmiana etapu | `reports/admin` | do ustalenia | 5178 | tabele z podtoru 4a |
| 5a | ankieta: głosowanie | `surveys/vote` | Jakub | 5179 | — |
| 5b | ankiety w panelu: tworzenie i wyniki | `surveys/admin` | Jakub | 5180 | tabele z podtoru 5a |
| 6 | licznik do dzwonka | `bell` | Kacper | 5181 | plan dzwonków od Kacpra (17.10). Bez niego licznik się nie pokazuje. |
| 7 | profil i ustawienia | `profile` | Jakub | 5182 | usunięcie konta czeka na pierwszy pull request podtoru 1a |
| 8 | panel Samorządu: rama, role, wydawanie kodów | `admin` | do ustalenia | 5183 | kody i role czekają na podtor 1b |
| 9 | pulpit | `dashboard` | Kacper | 5184 | kafelki czekają na pierwsze pull requesty podtorów 3a, 4a, 5a i 6. Do tego czasu pokazują pusty stan. |

Kolejne podtory dostają kolejne porty od 5185. Nowy podtor dopisuje Bohdan do tej tabeli przed startem agenta.

Pliki podtoru o katalogu `<moduł>/<część>`:

- ekrany i logika w telefonie: `src/features/<moduł>/<część>/`
- serwer: `worker/<moduł>/<część>/`
- testy całych ścieżek: `e2e/<moduł>-<część>.spec.ts`
- schemat bazy `worker/db/schema/<moduł>.ts` i dane testowe `worker/db/seed/<moduł>.ts`: tylko podtor „a” albo podtor bez litery

Tabele kont i sesji tworzy Better Auth swoim generatorem schematu. Należą do podtoru 1a.

Ankiety i licznik mogą skończyć najpóźniej 31.10 (`docs/PLAN_APLIKACJI.md`, część 6).

## 4. Co musi zrobić etap A, żeby tory nie zderzały się

Etap A robi jeden agent po drugim. Praca równoległa zaczyna się dopiero, gdy każdy punkt jest scalony w `main`:

1. Wszystkie pakiety z `docs/TECHNOLOGIE.md` są zainstalowane.
2. Router, adresy serwera, dolny pasek i menu panelu mają wpisy dla wszystkich podtorów z części 3. Każdy wpis prowadzi do `index.ts` podtoru z ekranem „W budowie”. `index.ts` modułu zbiera `index.ts` jego podtorów.
3. Schemat bazy i dane testowe mają osobny plik dla każdego modułu i jeden plik, który je zbiera.
4. Lista funkcji, które kasują dane ucznia przy usunięciu konta, ma wpis dla każdego modułu z danymi ucznia.
5. Serwer i Playwright biorą port ze zmiennej `PORT`.
6. Lint pozwala importować moduł tylko przez jego `index.ts` i zabrania cykli (`docs/STANDARD_KODU.md`, część 2).
7. CI ma sprawdzenie „Granice torów”: gałąź `feat/<podtor>-…` (na przykład `feat/3b-tabela`) zmienia tylko pliki swojego podtoru i `docs/zmiany/`. Skrypt i jedyna tabela mapowania podtorów: `.github/scripts/granice-torow.sh`, samotest: `.github/scripts/granice-torow.test.sh`. Gdy zmienia się tabela w części 3, samotest oblewa, dopóki skrypt jej nie dogoni.
8. Wspólne elementy ekranów i wygląd są gotowe (podtor 0).

Blokada: plik `.github/CODEOWNERS`, który sam prosi właściciela o przegląd, wymaga loginów GitHub. W `docs/OWNERS.md` brakuje loginów czterech osób. Dopisze je Adam.

## 5. Jak agent bierze zadanie

1. Każde zadanie to zgłoszenie na GitHubie z etykietą `tor:<podtor>` i osobą przypisaną (właściciel).
2. Agent bierze tylko zadanie ze zgłoszenia. W podtorze jest najwyżej jedno zadanie „w toku” naraz.
3. Agent pracuje w osobnej kopii repozytorium:

   ```bash
   git fetch origin
   git worktree add ../teb-<podtor> -b feat/<podtor>-<krótko> origin/main
   cd ../teb-<podtor> && npm ci
   ```

4. Agent uruchamia aplikację na porcie swojego podtoru, na przykład `PORT=5175`.
5. Agent otwiera pull request od razu jako szkic (draft). Gdy skończy, przenosi zmiany na najnowszy `main` (`git rebase origin/main`), jeszcze raz uruchamia build, testy i lint i oznacza pull request jako gotowy do przeglądu.
6. Pull request zamyka zgłoszenie (`Closes #<numer>`). Scala go Adam po zielonym CI.
7. `main` przyjmuje tylko gałąź aktualną względem `main`. Po każdym scaleniu pozostałe gotowe pull requesty trzeba zaktualizować przyciskiem „Update branch”. Podtory zmieniają różne pliki, więc aktualizacja nie daje konfliktów, ale uruchamia CI jeszcze raz.

## 6. Co robić przy konflikcie

- Konflikt w pliku swojego podtoru: agent go rozwiązuje i jeszcze raz uruchamia testy.
- Konflikt w pliku spoza podtoru: agent się zatrzymuje i pyta Bohdana. Nie rozwiązuje go sam.
- Brakuje czegoś w innym podtorze: agent zakłada zgłoszenie dla tamtego podtoru i pracuje dalej na tym, co jest. Nie zmienia cudzych plików.
- Brakuje czegoś w części wspólnej: zgłoszenie dla podtoru 0.
- Agent nigdy nie robi `git push --force` do cudzej gałęzi i nie scala pull requestów.

## 7. Ilu agentów naraz

Pracować może naraz tyle agentów, ile jest podtorów: dziś 15. Ograniczamy tylko pull requesty **gotowe do przeglądu**: najwyżej 4 naraz. Reszta czeka jako szkic. Ogranicza nas nie komputer, tylko ludzie: Adam przegląda każdy pull request, a właściciel sprawdza moduł na swoim telefonie. Kod, którego nikt nie przeczytał, nie wchodzi, bo trzeba go wyjaśnić na obronie.

Na jednym komputerze każdy agent ma osobną kopię repozytorium z własnym `node_modules`. Przy 15 agentach to kilka GB na dysku.

## 8. Przed uruchomieniem roju agentów

- [ ] etap A scalony, każdy punkt z części 4
- [ ] dla każdego podtoru, który rusza, jest zgłoszenie z właścicielem
- [ ] właściciel wie, że ma przeczytać i sprawdzić wynik
- [ ] każdy agent dostał polecenie z części 9 z wpisanym podtorem
- [ ] dwa agenty nigdy nie mają tego samego podtoru

## 9. Polecenie dla agenta podtoru

Wpisz podtor, katalog i numer zgłoszenia.

> Jesteś agentem podtoru `<podtor>` (katalog `<moduł>/<część>`) w repozytorium TEB Student. Zadanie jest w zgłoszeniu `#<numer>`. Zasady pracy są w `AGENTS.md`, a podział pracy w `docs/PODZIAL_PRACY.md`.
>
> 1. Pracuj w osobnej kopii repozytorium na gałęzi `feat/<podtor>-<krótko>` i na porcie swojego podtoru.
> 2. Zmieniaj tylko pliki swojego podtoru (część 3) i swój plik w `docs/zmiany/`. Nie dodawaj pakietów.
> 3. Inne moduły używaj tylko przez ich `index.ts`. Gdy czegoś brakuje, załóż zgłoszenie dla tamtego podtoru.
> 4. Konflikt w pliku spoza podtoru: zatrzymaj się i zapytaj Bohdana.
> 5. Otwórz pull request jako szkic. Na koniec przenieś zmiany na najnowszy `main`, uruchom build, testy i lint i oznacz pull request jako gotowy.
> 6. Gotowe znaczy: przechodzą testy i punkty z części 7 planu dla tego modułu.
