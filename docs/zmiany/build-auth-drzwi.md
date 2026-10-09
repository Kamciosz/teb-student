## Changelog

### Dodane

- Drzwi modułu auth wystawiają to, czego potrzebują inne podtory: po stronie serwera `requireStudent` i typy `Student` i `StudentEnv` (`worker/auth/index.ts`), po stronie telefonu `useAuthSession`, `signOutStudent` i typy `AuthSessionState` i `StudentSession` (`src/features/auth/index.ts`). Inne moduły importują je stąd, a nie z plików podtoru 1a.
- Bez zmian dla użytkownika.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-09 | #51, podtor 0: drzwi modułu auth | Dopisz re-eksporty `requireStudent`, `Student`, `StudentEnv` oraz `useAuthSession`, `signOutStudent` w drzwiach modułu auth. | Zmieniło `worker/auth/index.ts` i `src/features/auth/index.ts` oraz dodało ten plik. | do uzupełnienia | do uzupełnienia |
