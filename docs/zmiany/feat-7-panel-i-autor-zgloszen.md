## Changelog

### Dodane

- Profil (ekran 6.1a): wiersz „Panel Samorządu” albo „Panel redakcji” z odznaką („Samorząd”, „Redakcja” lub „Administrator”) i strzałką, który prowadzi do `/admin`. Wiersz widzi tylko osoba z rolą, uczeń go nie ma. Wiersz korzysta z `usePanelEntry()` z modułu panelu.
- Ikona `layout-dashboard` w `src/features/profile/icons.tsx` oraz styl odznaki `.pf-badge` w `profile.css`.
- Serwer profilu: funkcja `getStudentNames(db, userIds)` wyeksportowana z `worker/profile/index.ts`. Dla listy identyfikatorów kont zwraca imię i klasę z tabeli `profiles`. Konta bez profilu nie trafiają do wyniku. Lista jest dzielona na paczki po 90 identyfikatorów, bo D1 przyjmuje najwyżej 100 parametrów w jednym zapytaniu. Funkcja nie sprawdza roli, więc wywołujący (panel zgłoszeń) musi sprawdzić ją sam.
- Testy: `e2e/profile.spec.ts` sprawdza wiersz panelu dla każdej roli i brak wiersza dla ucznia bez roli; `worker/profile/profile.test.ts` sprawdza `getStudentNames` dla kont z profilem i bez, pustej listy oraz listy ponad 90 identyfikatorów.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | #76 i #70, podtor 7: wiersz Panelu Samorządu w profilu i imiona dla panelu zgłoszeń | Dodaj w profilu wiersz panelu z rolą (link do `/admin`, etykieta i odznaka z `usePanelEntry`) oraz wyeksportuj z `worker/profile/index.ts` funkcję zwracającą imię i klasę dla listy identyfikatorów kont; z testami. | Dodało wiersz i odznakę w `src/features/profile/ProfileHome.tsx`, ikonę w `icons.tsx`, styl w `profile.css`, funkcję `getStudentNames` w `worker/profile/profileRepository.ts` i eksport w `worker/profile/index.ts`, testy w `worker/profile/profile.test.ts` i `e2e/profile.spec.ts` oraz ten plik. | do uzupełnienia | do uzupełnienia |
