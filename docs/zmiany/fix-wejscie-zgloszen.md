## Changelog

### Dodane

- Pulpit ma kafel „Zgłoś problem” pod sekcjami z podpisem „Napisz, co nie działa w szkole.”. Stuknięcie otwiera formularz zgłoszenia.

### Zmienione

- Przycisk „Zgłoś problem” na ekranie „Moje zgłoszenia” pokazuje plus przed napisem, żeby było od razu widać, co robi. Napis zostaje w jednej linii, także przy szerokości 320 px.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | fix/wejscie-zgloszen | Dodaj kafel „Zgłoś problem” na pulpicie i plus z napisem w nagłówku „Moje zgłoszenia”, z testami e2e i zrzutami przy 375, 320 px i w ciemnym motywie. | Dodało `src/shared/ui/PlusIcon.tsx` i jego eksport w `src/shared/index.ts`. Dodało kafel w `src/features/dashboard/DashboardScreen.tsx`. Zmieniło `src/features/reports/student/MyReports.tsx` i `reportsStudent.css`. Dopisało testy w `e2e/dashboard.spec.ts` i `e2e/reports-student.spec.ts`. Dodało ten plik. | do uzupełnienia | do uzupełnienia |
