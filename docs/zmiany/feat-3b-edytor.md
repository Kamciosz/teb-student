## Changelog

### Dodane

- Kreator wpisów aktualnościowych w trzech krokach (typ, treść, podgląd) pod `/news/editor`, z edytorem Tiptap ładowanym leniwie.
- Własne elementy wpisu: film z YouTube w trybie youtube-nocookie (najpierw sama plansza, bez ramki), zdjęcie z podpisem, karta linku i sekcja „Źródła”.
- Czyszczenie tekstu wklejonego z Worda przed wstawieniem do edytora.
- `POST /api/news/editor/entries`: zapis szkicu lub publikacji. Serwer sprawdza treść względem schematu i nie ufa HTML-owi z telefonu.
- Drzwi autora (`requireNewsAuthor`): do czasu wprowadzenia ról zapis odpowiada 403 `role_required`.
- Testy Vitest (schemat, adresy, trasy z D1) i testy e2e edytora, w tym widok 320 px i tryb offline.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | #18, edytor wpisów (podtor 3b) | Zbuduj edytor wpisów na Tiptap z własnymi elementami i sprawdzaniem treści na serwerze, tylko w plikach podtoru 3b | Dodało `src/features/news/editor/`, `worker/news/editor/`, `e2e/news-editor.spec.ts` i ten plik | do uzupełnienia | do uzupełnienia |
