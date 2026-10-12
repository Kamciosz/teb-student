## Changelog

### Dodane

- Ankiety w panelu Samorządu: lista ankiet trwających i zakończonych z liczbą odpowiedzi (ekran 6.5a).
- Tworzenie ankiety: tytuł, pytania z od 2 do 5 odpowiedzi, czas trwania 3, 7 albo 14 dni i przycisk „Opublikuj ankietę” (ekran 6.5b). Ostatni dzień ankiety liczy serwer od dnia publikacji. Bez internetu przycisk jest nieaktywny.
- Wyniki ankiety od 5 odpowiedzi: liczba i udział każdej odpowiedzi w pełnych procentach, bez autorów (ekran 6.5d). Przy kilku pytaniach przycisk „Następne pytanie”.
- Poniżej 5 odpowiedzi ekran pokazuje tylko liczbę odpowiedzi (ekran 6.5c). Próg egzekwuje serwer: odpowiedź API poniżej progu nie ma rozkładu głosów ani treści odpowiedzi.
- Osoba bez roli dostaje 403, a ekran pokazuje komunikat „Tylko dla Samorządu”. Sprawdzanie roli jest tymczasowe: do czasu podtoru 8 odmawia każdemu uczniowi, więc ankiety w panelu zadziałają na prawdziwym serwerze po podpięciu jego middleware.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-12 | #23, podtor 5b: ankiety w panelu | Zbuduj tworzenie ankiet i wyniki od 5 odpowiedzi w panelu. Próg egzekwuje serwer, sprawdzony testem odpowiedzi HTTP. Uczeń bez roli dostaje 403. | Serwer w `worker/surveys/admin/` (lista, tworzenie, wyniki, walidacja, tymczasowy strażnik roli), ekrany w `src/features/surveys/admin/`, testy Vitest na prawdziwej D1 i `e2e/surveys-admin.spec.ts` | do uzupełnienia | Jakub |
