## Changelog

### Dodane

- Opcja „Opublikuj o wybranej godzinie” w podglądzie kreatora `/news/editor`: dzień i godzina są czasem warszawskim, także w dniu zmiany czasu.
- Zapis zaplanowanej publikacji w `POST` i `PUT /api/news/editor/entries`: serwer przyjmuje tylko przyszłą godzinę, najwyżej 30 dni naprzód; pusta godzina oznacza publikację od razu.
- Po zapisie zaplanowanego wpisu komunikat „Wpis pojawi się <dzień, godzina>”.
- Testy Vitest (przeszłość i ponad 30 dni odrzucone, pusta godzina przyjęta, zamiana czasu warszawskiego) i testy e2e zaplanowanej publikacji.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | podtor 3b, zaplanowana publikacja (część #118) | Dodaj wybór godziny publikacji w kreatorze i walidację `publishAt` na serwerze, bez zmiany schematu | Dodało `worker/news/editor/validatePublishAt.ts`, `src/features/news/editor/warsawTime.ts` i testy; zmieniło `validateEntry.ts`, `routes.ts`, `PreviewStep.tsx`, `NewsEditorScreen.tsx`, `api.ts`, `texts.ts` i `e2e/news-editor.spec.ts` | do uzupełnienia | do uzupełnienia |
