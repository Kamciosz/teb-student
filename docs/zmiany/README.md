# Wpisy z pull requestów

Każdy pull request dodaje tu jeden plik zamiast zmieniać `CHANGELOG.md` i `docs/LOG_AI.md`. Dzięki temu równoległe gałęzie nie zmieniają tej samej linii i nie mają konfliktów.

Nazwa pliku to nazwa gałęzi, w której `/` zamieniamy na `-`. Gałąź `feat/ankiety-wyniki` ma plik `docs/zmiany/feat-ankiety-wyniki.md`.

Szymon przenosi wpisy do `CHANGELOG.md` i `docs/LOG_AI.md` osobnym pull requestem, a potem kasuje przeniesione pliki. Ten plik zostaje.

## Wzór pliku

```markdown
## Changelog

### Dodane

- Ekran wyników ankiety dla Samorządu, od 5 odpowiedzi.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-20 | #12, wyniki ankiety | … | … | … | Jakub |
```

- **Changelog:** sekcje jak w `CHANGELOG.md` (Dodane, Zmienione, Naprawione, Usunięte). Gdy zmiana nie zmienia działania aplikacji, napisz „Bez zmian dla użytkownika”.
- **Log AI:** te same kolumny co w `docs/LOG_AI.md`. Agent wypełnia pierwsze cztery, właściciel zadania dwie ostatnie.
