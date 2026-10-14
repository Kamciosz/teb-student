## Changelog

### Zmienione

- Publikacja szkicu, który w tym czasie poszedł do korekty, pokazuje osobny komunikat: „Ten wpis czeka na korektę. Opublikuje go redaktor, który go sprawdzi.” (`src/features/news/admin/texts.ts::TO_AGREE.inReview`, do uzgodnienia). Wcześniej każdy błąd publikacji dawał ogólny komunikat, a 409 był po cichu traktowany jak sukces.
- `src/features/news/admin/api.ts::publishEntry` rozróżnia 409 z `{ "error": "in_review" }`, który rzuca `EntryInReviewError`, od 409 `already_published` i 409 bez kodu, które nadal są sukcesem. Ciało odpowiedzi czyta się ostrożnie, więc zły JSON nie psuje publikacji.
- `src/features/news/admin/NewsAdminScreen.tsx` wybiera tekst komunikatu przez `publishErrorText`, w tym samym komponencie `Notice` (`role="alert"`). Lista odświeża się po błędzie jak dotąd.
- Testy `src/features/news/admin/api.test.ts` sprawdzają mapowanie kodów: 200, 409 `already_published`, 409 `in_review`, 409 bez ciała, 409 z nieczytelnym ciałem, 503 i błąd sieci.
- Test `e2e/news-admin.spec.ts` („publikacja wpisu w korekcie…”) podstawia odpowiedź 409 `in_review` i sprawdza komunikat, kafel „Do korekty” i brak przycisku „Opublikuj” po odświeżeniu listy.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 3c, komunikat dla wpisu w korekcie (draft, część #147) | Odróżnij 409 `in_review` od 409 `already_published` przy publikacji, pokaż osobny komunikat w tym samym `Notice`, odśwież listę, dopisz testy Vitest i przypadek e2e. | Zmieniło `src/features/news/admin/api.ts`, `src/features/news/admin/api.test.ts` (nowy), `src/features/news/admin/texts.ts`, `src/features/news/admin/NewsAdminScreen.tsx`, `e2e/news-admin.spec.ts` oraz ten plik. | do uzupełnienia | Szymon Sosnowski |
