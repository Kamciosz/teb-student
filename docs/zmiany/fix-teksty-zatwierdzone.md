## Changelog

### Zmienione

- Teksty zatwierdzone przez Szymona (14.10.2026): „Opublikowano wpis” i „Usunięto wpis” na ekranie dziennika, „Adres posta z Instagrama, TikToka, Facebooka albo X” przy karcie linku, „Brak internetu. Wpis został w edytorze. Wyślesz go, gdy internet wróci.” w edytorze, „Wysyłam zdjęcie…” przy wysyłaniu zdjęcia z raportu, „Dziś lekcje skrócone” przy przełączniku dnia skróconego, skala ankiety od „zdecydowanie nie” do „zdecydowanie tak”.
- Oznaczenia `TO_AGREE` i zwroty „do uzgodnienia” i „do ustalenia” zdjęte z tekstów, które zatwierdził Szymon. Bez zmian dla użytkownika.

### Usunięte

- Kafel „Dodaj zdjęcie albo wideo” w pierwszym kroku edytora wpisu. Nic nie robił, a zdjęcia i filmy dodaje się w treści. Razem z nim zniknęły martwe elementy: ikona plusa i klasy `.editor-media`.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | teksty zatwierdzone (PR do uzupełnienia) | Wdrożyć poprawki tekstów z listy TO_AGREE, usunąć kafel „Dodaj zdjęcie albo wideo”, zdjąć oznaczenia TO_AGREE w plikach z listy, poprawić e2e, dopisać zdanie o zatwierdzeniu w STAN_PRAC. | Zmieniło teksty w `src/features/*` z listy (news, surveys, bell, reports, dashboard, admin), `TypeStep.tsx`, `texts.ts` i `editor.css` w edytorze, usunęło `src/features/news/editor/icons.tsx`, poprawiło e2e (`news-editor`, `bell`, `surveys-vote`) i testy Vitest, zmieniło `docs/STAN_PRAC.md`, dodało ten plik. | do uzupełnienia | Szymon |
