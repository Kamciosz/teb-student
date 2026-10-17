## Changelog

### Dodane

- Wygląd aplikacji systemowej (ADR 0007, `docs/adr/0007-wyglad-aplikacji-systemowej.md`): jasny i ciemny motyw w `src/shared/styles/tokens.css`, czcionka systemu, skala rozmiarów w `rem`. Kolory są tylko w tokenach.
- Ustawienia: wybór motywu „Automatyczny”, „Jasny” albo „Ciemny” zamiast ośmiu palet. Motyw działa od razu, bez zapisu, i zostaje w tym urządzeniu po ponownym uruchomieniu. Nie idzie na serwer.
- Komponenty wspólne: `ListGroup` i `ListRow` (grupowane listy z wierszami), z testami.

### Zmienione

- Wspólne komponenty w `src/shared/ui/` dostają nowy wygląd: `Button` (warianty filled, plain, destructive), `Chip` (segmenty), `Badge`, `TextField`, `EmptyState`, `ProgressBar` (wypełnienie przez `transform`), `Sheet` (jedyny cień, przejście 200 ms). Przy `prefers-reduced-motion` przejścia są wyłączone.
- Motyw telefonu wybiera jasny albo ciemny wygląd (`prefers-color-scheme`); atrybut `data-motyw` na `<html>` wymusza wybór. Akcent szkoły to `data-szkola`: liceum niebieski, technikum czerwony, w obu motywach.
- Stary zapis wyglądu (`{palette, school}`) jest wczytywany jako motyw Automatyczny, bez błędu.
- Pasek przeglądarki i manifest PWA mają jasne kolory tła (`#F2F2F7`).
- Testy e2e: `e2e/profile.spec.ts` sprawdza motyw zamiast palety. Test z ośmioma paletami został usunięty, a nowe testy sprawdzają motyw po przeładowaniu, z niedziałającym serwerem profilu i razem z akcentem szkoły. Asercje nie były osłabiane.

### Usunięte

- Osiem palet kolorów z ustawień (wybór w interfejsie). Paleta zostaje w bazie i w walidacji serwera (podtor 7), ale strona jej nie używa.

### Uwagi

- Kontrast: `--success` w jasnym motywie to `#1F7A36` zamiast `#248A3D` ze specyfikacji, bo `#248A3D` daje 4,40:1 na białym kaflu (za mało). Pozostałe wartości są w komentarzu w `tokens.css`.
- `--shadow: none` wyłącza cień także w pasku dolnym (Dock). Dock.tsx i Dock.css nie były zmieniane, bo należą do innego podtoru.
- Ekrany funkcjonalne (panel, ogłoszenia, zgłoszenia, ankiety, pulpit) nadal mają własne style z przejściami i cieniami. Nie były przerabiane w tym PR.
- Lokalny `EmptyState` w `NewsAdminScreen.tsx` i `ReportsList.tsx` nie korzysta ze wspólnego komponentu.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-17 | wygląd systemowy (ADR 0007), gałąź `feat/wyglad-systemowy` | Wprowadź wygląd aplikacji systemowej: tokeny jasny i ciemny, czcionka systemu, motyw w ustawieniach zamiast palet, wspólne komponenty, `ListGroup` i `ListRow`, ADR i changelog. Nie ruszaj Docka ani ekranów funkcjonalnych. | Zmieniło `src/shared/styles/tokens.css` i `base.css`, `index.html`, `vite.config.ts`, `src/features/profile/` (motyw zamiast palety), `src/shared/ui/` (komponenty i nowe `ListGroup`, `ListRow`), `e2e/profile.spec.ts` i `e2e/pwa.spec.ts`, `docs/adr/0007-wyglad-aplikacji-systemowej.md` oraz ten plik. | do uzupełnienia | do uzupełnienia |
