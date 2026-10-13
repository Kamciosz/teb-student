## Changelog

### Zmienione

- Bez zmian dla użytkownika. Drzwi modułu `worker/surveys/index.ts` wystawiają `countSurveyParticipations(env.DB)` z podtoru 5a: liczbę udziałów w ankietach (wierszy `survey_participation`). Panel Samorządu (podtor 8) pokaże ją jako liczbę osób, które wypełniły ankiety, importując tylko z `worker/surveys`. Funkcja zwraca samą liczbę, bez numerów uczniów i bez wyborów odpowiedzi.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #75, podtor 5a: eksport `countSurveyParticipations` | Dodaj `countSurveyParticipations(db)` (liczba wierszy `survey_participation`, bez wyborów odpowiedzi i bez numerów uczniów), wystaw przez `worker/surveys/vote/index.ts` i `worker/surveys/index.ts`, dodaj test importujący z drzwi modułu. | Dodało funkcję i komentarz w `worker/surveys/vote/countParticipations.ts`, test w `worker/surveys/vote/countParticipations.test.ts`, eksport w `worker/surveys/vote/index.ts` i `worker/surveys/index.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
