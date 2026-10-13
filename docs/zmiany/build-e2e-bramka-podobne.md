## Changelog

### Zmienione

- Test „401 przy wysyłaniu zgłoszenia” (`e2e/shared-bramka.spec.ts`) podstawia pustą listę podobnych zgłoszeń (`/api/reports/student/similar`). Krok „Mnie też to dotyczy” z podtoru 4a (#109) pyta o tę listę przed opisem, więc bez atrapy pierwsze 401 przychodziło z odczytu, a nie z wysyłki. Na obecnym `main` ta trasa jeszcze nie istnieje, więc atrapa niczego nie zmienia.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | test bramki pod krok „Mnie też” (`build/e2e-bramka-podobne`) | Uniezależnij test bramki od nowego zapytania o podobne zgłoszenia z #109. | Dodało atrapę listy w `e2e/shared-bramka.spec.ts` i ten plik. | | |
