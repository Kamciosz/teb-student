## Changelog

### Zmienione

- Ekrany redakcji w nowym wyglądzie (zgodnie z `docs/projekt/wyglad-ekranow.md`): lista wpisów w ramie panelu i kreator „Nowy wpis” (typ, treść, podgląd, korekta).
- Lista wpisów: nagłówek `ScreenHeader` z przyciskiem „Wróć” do panelu, kafle jako wiersze listy z akcjami tekstowymi, „Usuń” jako czerwony tekst, arkusz potwierdzenia usuwania z przyciskiem „Anuluj” z fokusem.
- Kreator: krok 1 z wyborem typu jako segmenty (`Chip`), krok 2 z polami w grupie (tytuł jako `TextField`, treść z nagłówkiem sekcji), krok 3 z przełącznikiem „Opublikuj o wybranej godzinie” jako wierszem listy.
- Jeden wypełniony przycisk „Opublikuj” przyklejony na dole ekranu, z odstępem `env(safe-area-inset-bottom)` na telefonach. Przy krótkiej treści przycisk też leży przy dolnej krawędzi widoku. „Zapisz szkic i dokończ później” zwykłym tekstem.
- Okienka linku, filmu, karty linku, źródeł i opisu zdjęcia: pola w stylu grupy, przyciski jak w reszcie ekranów.
- Kolory tylko z tokenów `var(--…)`, czcionka systemowa, animacje transform/opacity 150–250 ms, przy `prefers-reduced-motion` wyłączone.

### Usunięte

- Nieużywany komponent `src/features/news/admin/PanelTop.tsx` oraz jego stary CSS i klasy.

### Uwagi

- Zmiana wyglądu, bez zmian logiki: zapis, publikacja, przypinanie, usuwanie, wysyłanie zdjęć, API, planowanie, zatwierdzenie i liczenie znaków działają tak samo.
- Testy: w `e2e/news-admin.spec.ts` zmieniono dwie rzeczy. (1) Pusty stan sprawdza się po tekście, a nie po roli nagłówka: wspólny `EmptyState` renderuje tytuł jako akapit, a zmiana wspólnego komponentu jest poza zakresem tego zadania. Przez to asercja nie sprawdza już semantyki nagłówka; pokrycie tego wymaga osobnego zadania. (2) Dwie asercje przycisków arkusza usuwania przy 320 px używają `expect.poll`, bo pomiar w trakcie animacji wejścia dawał wynik zależny od chwili. Sprawdzają to samo, po zakończeniu animacji. Żadna asercja nie została usunięta.
- Luki: na liście wpisów nie ma filtrów; brak danych i UI, których nie było w zadaniu; edytor to kreator w trzech krokach, a nie jeden formularz; w edytorze nie ma przycisku „Usuń”; `ScreenHeader` nie ma `onBack` dla kroków 2 i 3, więc kroki 2 i 3 używają lokalnego paska z przyciskiem „Wróć”; brak ikon w większości przycisków.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | restyl ekranów redakcji (podtory 3b i 3c), draft PR z gałęzi `style/ekran-redakcja` | Przerób ekrany redakcji (`src/features/news/admin/` i `src/features/news/editor/`) według `docs/projekt/wyglad-ekranow.md`: `ScreenHeader` z „Wróć”, pola w `ListGroup`, przełączniki jako wiersze, jeden przycisk „Opublikuj” przyklejony na dole. Logika bez zmian. Usuń nieużywane komponenty, CSS i testy. Zrób testy, build i zrzuty przy 320, 390 i 1280 px w obu motywach. | Zmieniło pliki w `src/features/news/admin/` (`NewsAdminScreen.tsx`, `EntryTile.tsx`, `DeleteSheet.tsx`, `Notice.tsx`, `icons.tsx`, `texts.ts`, `newsAdmin.css`; usunięto `PanelTop.tsx`), w `src/features/news/editor/` (`NewsEditorScreen.tsx`, `WizardTop.tsx`, `TypeStep.tsx`, `ContentStep.tsx`, `PreviewStep.tsx`, `ReviewStep.tsx`, `LazyEditor.tsx`, `AddressPanel.tsx`, `PhotoCaptionPanel.tsx`, `editor.css`), w `e2e/news-admin.spec.ts` oraz ten plik. | — | Szymon |
