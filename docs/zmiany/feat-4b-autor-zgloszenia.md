## Changelog

### Dodane

- Szczegół zgłoszenia nieanonimowego (ekran 6.4c z `docs/projekt/EKRANY.md`) pokazuje imię i klasę autora, np. „Ola · 3TA”, z modułu profilu przez `getStudentNames`. Pod spodem zostaje napis „Autor zgłosił bez anonimowości.”.
- Odpowiedź `GET /api/reports/admin/:id` ma pole `student` (`{ name, className }` albo `null`). Zgłoszenie anonimowe dostaje `null`, a serwer dla niego w ogóle nie czyta profilu autora.

### Zmienione

- `getReport` w `worker/reports/admin/reportsAdminRepository.ts` czyta numer autora tylko przy zgłoszeniu nieanonimowym i oddaje imię z klasą. Numer autora nie wychodzi z tego pliku ani z odpowiedzi HTTP.
- Kafel autora w `src/features/reports/admin/ReportDetail.tsx` pokazuje „Imię · Klasa”, gdy serwer je poda. Bez nich zostaje dotychczasowy napis.

### Testy

- Vitest `worker/reports/admin/routes.test.ts`, nowy opis „imię i klasa autora”: zgłoszenie podpisane ma imię i klasę bez numeru ucznia, bez profilu `student` to `null`, a anonimowe nie dostaje danych autora, nawet gdy profil istnieje. Test anonimowości z poprzedniego opisu nie zmieniony.
- e2e `e2e/reports-admin.spec.ts`: szczegół podpisanego zgłoszenia pokazuje „Ola · 3TA”, a anonimowe pokazuje tylko napis o anonimowości.

### Do rozstrzygnięcia

- Test „szczegół nie zawiera autora” nadal sprawdza `/seed-cudze`, czyli zgłoszenie podpisane, i przechodzi, bo odpowiedź nie zawiera numeru ucznia ani słowa „author”. Jego tytuł i opis mówią jednak „nie zawiera autora”, a dla podpisanych zgłoszeń to już nieprawda. Zespół decyduje, czy przeformułować tę asercję. Nie zmieniano jej, bo polecenie mówi, że ma zostać.
- Zgłoszenie podpisane bez profilu autora pokazuje tylko napis „Autor zgłosił bez anonimowości.”. Projekt nie opisuje tego przypadku, więc to nasza decyzja do zatwierdzenia.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | szczegół zgłoszenia: imię i klasa autora (podtor 4b, ekran 6.4c) | Pokaż imię i klasę autora w szczegółach nieanonimowego zgłoszenia przez `getStudentNames`, anonimowe bez danych autora, test i e2e, tylko w plikach podtoru 4b | Zmieniło `worker/reports/admin/` (reportsAdminRepository, routes, routes.test), `src/features/reports/admin/` (api, ReportDetail), `e2e/reports-admin.spec.ts` i dodało ten plik | do uzupełnienia | do uzupełnienia |
