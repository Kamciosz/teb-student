## Changelog

### Dodane

- Plik CSV z wynikami zawiera teraz pytania krótkiej odpowiedzi: każda odpowiedź ma własny wiersz, w kolejności jak na ekranie wyników (alfabetycznie). Pliku nie podpisujemy danymi autora. Jak wcześniej, plik pojawia się dopiero od progu 5 odpowiedzi.
- Plik CSV zawiera średnią ze skali 1–5: osobny wiersz „Średnia” pod głosami na wartości 1–5, z przecinkiem dziesiętnym jak na ekranie (np. 3,4). Nowa piąta kolumna „Średnia” jest pusta w pozostałych wierszach. (Do uzgodnienia: nazwa wiersza i kolumny.)

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 5b: CSV z krótką odpowiedzią i skalą | Dodaj do CSV wyników krótką odpowiedź (każda w osobnym wierszu, kolejność jak na ekranie, bez autora, od progu 5) i skalę 1–5 (głosy i średnia). Escapowanie i ochrona przed formułami. | Wiersz na tekst krótkiej odpowiedzi i wiersz „Średnia” skali w `worker/surveys/admin/csv.ts`, piąta kolumna w nagłówku, testy w `worker/surveys/admin/csv.test.ts`, `worker/surveys/admin/routes.test.ts` (kolejność, próg 4 i 5, średnia z przecinkiem) i fixture CSV w `e2e/surveys-admin.spec.ts` | do uzupełnienia | Szymon Sosnowski |
