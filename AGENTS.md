# Zasady pracy w repozytorium TEB Student

Dla ludzi i agentów AI. Czytaj w całości przed pierwszą zmianą.

## Najpierw przeczytaj

1. `docs/PLAN_APLIKACJI.md`: zakres, terminy, warunki „gotowe” (część 7), polecenie dla agenta orkiestrującego (część 9).
2. `docs/TECHNOLOGIE.md`: technologie i wersje. Agent ich nie zmienia sam. W sprawach technicznych pyta Bohdana.
3. `docs/projekt/EKRANY.md`: teksty na ekranach. Nowych tekstów nie wymyślamy.
4. `docs/ARCHITECTURE.md` i `docs/adr/`: jak zbudowana jest aplikacja i dlaczego.
5. `docs/STANDARD_KODU.md`: komentarze, czytelny kod, testy. Obowiązuje w każdym pliku.

## Kiedy zadanie jest gotowe

- Działa na telefonie i spełnia punkty z części 7 planu.
- Przechodzą build, testy i lint. Komendy dopisuje szkielet (etap A):

```bash
# build:  (dopisze szkielet)
# testy:  (dopisze szkielet)
# lint:   (dopisze szkielet)
```

- CI na pull requeście jest zielone, a Adam zatwierdził zmianę.
- Testów nie osłabiamy, żeby przeszły. Gdy test jest zły, piszemy to w pull requeście.

Sam napisany kod nie oznacza „gotowe”.

## Praca agentów

- Jeden agent to jedno zadanie, jedna gałąź i jeden pull request. Agent rusza tylko swój moduł.
- Etap A (szkielet, wygląd) robi jeden agent po drugim. Moduły fali 1 mogą potem robić agenci równolegle.
- Wspólne ustalenia (technologie, nazwy, wygląd, wymiana danych) zapisujemy przed pracą równoległą w `docs/adr/`.
- Gdy czegoś brakuje albo plan sam sobie przeczy, agent się zatrzymuje i pyta Szymona, a w sprawach technicznych Bohdana. Dotyczy to zwłaszcza planu dzwonków, danych osobowych i treści ekranów.
- Do każdego zadania agent dopisuje wpis w `docs/LOG_AI.md`.

## Kod

- Najprostsze rozwiązanie zadania. Bez warstw i ustawień „na później”.
- Najpierw to, co już jest w projekcie, potem funkcje przeglądarki, dopiero potem nowa biblioteka. Nowa biblioteka wymaga wpisu w `docs/adr/` i zgody Bohdana.
- Nazwy w kodzie po angielsku. Teksty dla ucznia po polsku, z polskimi znakami.
- Nowa funkcja to nowy moduł, nie doklejka do istniejącego pliku.
- Bez martwego kodu, wykomentowanych bloków i `console.log` w kodzie produkcyjnym.
- Komentarze wszędzie, po polsku i po angielsku (`PL:`, potem `EN:`): plik, każda funkcja, typ, stała i każdy krok w funkcji. Kodu bez komentarza nie scalamy. Szczegóły i przykład: `docs/STANDARD_KODU.md`, część 1.
- Limity długości i zagnieżdżenia funkcji: `docs/STANDARD_KODU.md`, część 2.
- Zasady techniczne (kolory, CSS, zdjęcia, filmy, R2, dane w telefonie) są w `docs/TECHNOLOGIE.md`, sekcja „Zasady dla agentów”.

## Prywatność

- Bez prawdziwych imion, nazwisk i adresów e-mail w kodzie, testach, zrzutach i dokumentacji. Dane testowe są wymyślone.
- Z ankiety nie da się ustalić, kto co odpowiedział. Samorząd nie widzi autora zgłoszenia anonimowego.
- Sekrety (klucze Cloudflare, Resend, hasła) nie trafiają do repozytorium. Lokalnie są w `.dev.vars`, który jest w `.gitignore`. Sekret wrzucony do historii trzeba unieważnić, samo usunięcie pliku nie wystarczy.

## Git

- Nikt nie wrzuca zmian prosto do `main`. Pull request zatwierdza i scala Adam.
- Gałęzie: `feat/opis`, `fix/opis`, `docs/opis`, `refactor/opis`, `test/opis`, `chore/opis`.
- Commity w formacie Conventional Commits, temat po polsku w trybie rozkazującym, na przykład `feat(zgloszenia): dodaj wybór miejsca`. Hook i CI to sprawdzają.
- Commit podpisuje osoba z zespołu, właściciel zadania. Bez dopisków o AI: żadnego `Co-Authored-By` z modelem, `Generated with` ani emoji robota. To wymóg PZO.
- Przed pull requestem: `git fetch && git rebase origin/main`. Bez `--force` na wspólnych gałęziach, na własnej tylko `--force-with-lease`.

## Dokumentacja

- Zmiana zachowania aplikacji: `CHANGELOG.md`, sekcja `Unreleased`.
- Decyzja techniczna: nowy plik `docs/adr/NNNN-tytul.md`.
- Nowy moduł: wiersz w `docs/ARCHITECTURE.md`.
