# Jak pracujemy

## Pierwsze uruchomienie

```bash
git clone https://github.com/Kamciosz/teb-student.git
cd teb-student
npm install
```

`npm install` ustawia `core.hooksPath` na `.githooks`, więc hook sprawdza każdy commit. Sprawdź, czy działa:

```bash
git config core.hooksPath
```

Wynik powinien brzmieć `.githooks`.

## Gałęzie

| Typ | Nazwa | Od czego |
|---|---|---|
| funkcja | `feat/krotki-opis` | `main` |
| poprawka | `fix/krotki-opis` | `main` |
| dokumentacja | `docs/krotki-opis` | `main` |
| refaktor | `refactor/krotki-opis` | `main` |

`main` zawsze się buduje i przechodzi testy. Nikt nie wrzuca zmian prosto do `main`.

## Commity

```
<typ>(<zakres>): co i po co        temat od 10 do 72 znaków

Dlaczego ta zmiana jest potrzebna.
Jak to sprawdzić.
```

Typy: `feat`, `fix`, `docs`, `style`, `refactor`, `perf`, `test`, `build`, `ci`, `chore`, `revert`.

Temat piszemy po polsku w trybie rozkazującym: „dodaj”, „popraw”, „usuń”. Przykład: `feat(ankiety): dodaj ekran wyników dla Samorządu`.

Hook odrzuca zły format i ślady AI w commicie. CI sprawdza to samo w każdym pull requeście.

## Pull request

1. `git fetch && git rebase origin/main`.
2. Wypełnij szablon: co, po co, jak sprawdzone, ryzyka.
3. Adam przegląda i scala. Bez zielonego CI nie scalamy.
4. Właściciel modułu czyta zmianę i umie ją wyjaśnić na obronie.

## Kiedy gotowe

- [ ] build, testy i lint przechodzą lokalnie (komendy w `AGENTS.md`)
- [ ] punkty z części 7 planu działają na telefonie, także przy szerokości 320 px
- [ ] `CHANGELOG.md` uzupełniony
- [ ] wpis w `docs/LOG_AI.md`, jeśli pomagało AI
- [ ] brak martwego kodu, `console.log` i plików tymczasowych
