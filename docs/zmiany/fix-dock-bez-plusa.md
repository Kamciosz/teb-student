## Changelog

### Zmienione

- Dolny pasek ma pięć równych pozycji: Pulpit, Aktualności, Zgłoszenia, Ankiety i Profil. Przycisk „+” zniknął, bo nie ma już skrótu do zgłaszania problemu z paska. Zgłoszenie zostaje w ekranie Zgłoszenia.
- Pasek wygląda jak w natywnej aplikacji iPhone'a: pełna szerokość, przyklejony do dołu, cienka linia u góry, lekko przezroczyste tło. Ikona 24 px nad krótkim napisem, aktywna pozycja w kolorze akcentu szkoły.
- Treść ekranów z paskiem ma odstęp pod paskiem, więc ostatni element da się przewinąć nad pasek. Odstęp liczy się z jednej zmiennej `--dock-h`.
- Pasek nie ucina napisów przy szerokości 320 px, a każda pozycja ma co najmniej 44 × 44 px.
- Aplikacja w telefonie uwzględnia górny odstęp systemowy (`env(safe-area-inset-top)`), a strona ma `viewport-fit=cover`.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-17 | fix/dock-bez-plusa | Przebuduj dolny pasek: pięć pozycji bez „+”, ikony, wygląd natywnej aplikacji iPhone'a, odstęp pod treścią i safe-area. | Dodało `src/shared/ui/Icon.tsx` (wspólne ikony). Przepisało `Dock.tsx`, `Dock.css` i `Dock.test.tsx`. Zmieniło `items.ts`, `shared/index.ts`, `profile/icons.tsx`, `base.css`, `index.html` i `e2e/dashboard.spec.ts`. Dodało ten plik. | do uzupełnienia | do uzupełnienia |
