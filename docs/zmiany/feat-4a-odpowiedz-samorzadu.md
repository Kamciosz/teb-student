## Changelog

### Dodane

- Odpowiedź Samorządu przy zmianie etapu: kolumna `note` w tabeli historii `report_stage_changes` (krótki tekst, do 500 znaków). Limit pilnuje baza przez `CHECK`, a stała `MAX_STAGE_NOTE_LENGTH` w `worker/db/schema/reports.ts` mówi, skąd on się bierze.
- „Moje zgłoszenia”: pod paskiem etapu oś historii z datą i nazwą każdego etapu. Przy etapie, który ma odpowiedź, widać ją pod napisem „Odpowiedź Samorządu”. Odpowiedź widzi także uczeń, który wysłał zgłoszenie anonimowo, bo odczyt nie zna autora.
- Serwer: `GET /api/reports/student` oddaje w każdym zgłoszeniu `history` (etap, odpowiedź albo `null`, chwila), od najstarszego. Nie zawiera numeru członka Samorządu, który zmienił etap.
- Usuwanie konta: numer członka Samorządu w `report_stage_changes.changed_by` jest zerowany, więc konto nie zostawia śladu w historii. Odpowiedzi i zgłoszenia zostają, bez autora.
- Dane testowe: odpowiedzi w `REPORT_STAGE_CHANGES_SEED` przy zgłoszeniach `seed-projektor` i `seed-okno`.
- Testy: `worker/reports/student/reportsRepository.test.ts` (kolejność historii, brak numeru członka, limit 500 znaków w bazie), rozszerzony `deleteStudentData.test.ts` (czyszczenie `changed_by`), `reportView.test.ts` (`stageLabel`) oraz e2e w `e2e/reports-student.spec.ts` (oś historii i odpowiedź Samorządu).

### Do zrobienia w podtorze 4b

- Panel Samorządu: `changeReportStage` zapisuje już wpis historii, ale bez odpowiedzi. Potrzebny jest parametr `note` z walidacją do `MAX_STAGE_NOTE_LENGTH` i zapis do tego samego wiersza historii.

### Uwaga

- Repo nie ma katalogu migracji. Nowa kolumna `note` i `CHECK` powstają z schematu przy `npm run db:reset`. Istniejąca baza wymaga ręcznego `ALTER TABLE`, zanim wdroży się tę zmianę.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 4a: odpowiedź Samorządu przy zmianie etapu (gałąź `feat/4a-odpowiedz-samorzadu`) | Dodaj krótką odpowiedź przy zmianie etapu (kolumna `note`, do 500 znaków), oś historii w „Moje zgłoszenia” z odpowiedzią, zerowanie numeru członka przy usuwaniu konta, testy Vitest i e2e. Panel 4b nie ruszać. | Dodało kolumnę `note` i `CHECK` w `worker/db/schema/reports.ts`, odpowiedzi w `worker/db/seed/reports.ts`, historię w `worker/reports/student/reportsRepository.ts`, zerowanie `changed_by` w `deleteStudentData.ts`, typy i oś w `api.ts`, `reportView.ts`, `MyReports.tsx`, style `rs-history` i `rs-note`, testy `reportsRepository.test.ts`, `deleteStudentData.test.ts`, `reportView.test.ts` oraz e2e. | do uzupełnienia | Szymon Sosnowski |
