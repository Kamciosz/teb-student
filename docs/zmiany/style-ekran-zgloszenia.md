## Changelog

### Zmienione

- Ekran „Moje zgłoszenia” (`/reports/student/moje`) ma nagłówek z przyciskiem „Zgłoś problem”, a zgłoszenia są wierszami listy z etapem po prawej stronie zamiast kart.
- Kreator „Zgłoś problem” (`/reports/student`) ma kategorie jako wiersze listy, dolny pasek z przyciskiem „Dalej” i strzałkę „Wstecz” w nagłówku. Dock znika z kreatora.
- Ekran „Ktoś już to zgłosił?” ma nagłówek z poziomu sekcji (h2), bo tytuł strony zostaje jeden.
- Ekran „Wysłane” ma przyciski w dolnym pasku, tak samo jak kreator.
- Style ekranów zgłoszeń opierają się na kicie `shared/ui` (ListRow, ListGroup, ScreenHeader, ProgressBar, EmptyState). Kolory tylko przez zmienne `var(--…)`.

### Dodane

- Szczegóły zgłoszenia (`/reports/student/moje/:id`): pasek postępu z trzema etapami, data i opis zgłoszenia, historia z odpowiedzią Samorządu.
- Stan pusty listy „Moje zgłoszenia” z przyciskiem „Zgłoś problem”.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | podtor 4a: restyl ekranów zgłoszeń ucznia (gałąź `style/ekran-zgloszenia`) | Przerób ekrany zgłoszeń ucznia wg `docs/projekt/wyglad-ekranow.md` i opisu właściciela: lista, kreator, szczegóły, wiersze z kitu, bez gradientów i cieni, tylko zmienne kolorów. | Zmieniło pliki w `src/features/reports/student/` (lista, kreator, kroki, podobne zgłoszenia, ekran wysłania, szczegóły, CSS, pomocnicze i testy), `e2e/reports-student.spec.ts` oraz dodało ten plik. Dodało `ReportDetails.tsx`, usunęło `FlowTop.tsx`. | — | Szymon |
