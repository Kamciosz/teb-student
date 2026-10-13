## Changelog

### Dodane

- Pod polem krótkiej odpowiedzi w ankiecie stoi stała podpowiedź: „Nie wpisuj imienia ani klasy. Odpowiedź jest anonimowa.”. Jest widoczna zawsze, także przy pustym polu. Pole czyta ją razem z licznikiem znaków (`aria-describedby`). Tekst jest do uzgodnienia (`TO_AGREE`).

### Uwagi

- Walidacja i serwer bez zmian.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 5a, podpowiedź o anonimowości (gałąź `feat/5a-podpowiedz-anonimowosci`, baza `feat/5a-krotka-odpowiedz`) | Dodaj pod polem krótkiej odpowiedzi stałą podpowiedź o anonimowości, połączoną z polem przez aria-describedby; test i asercja w e2e | `src/features/surveys/vote/QuestionStep.tsx` (podpowiedź i `aria-describedby`), `texts.ts` (`TO_AGREE.shortTextHint`), nowy `QuestionStep.test.tsx`, `e2e/surveys-vote.spec.ts`, ten dokument | do uzupełnienia | Szymon |
