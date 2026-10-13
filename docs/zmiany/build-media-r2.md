## Changelog

### Zmienione

- Bez zmian dla użytkownika. Zasobnik R2 `teb-media` (binding `MEDIA`) jest w `wrangler.jsonc`, a typ `Env` w `worker/shared/index.ts` zna pole `MEDIA`. Potrzebne podtorowi 2 (zdjęcia i filmy).

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Zgłoszenie #16 (podtor 2), osobny PR z wiązaniem R2 | Dodaj zasobnik R2 jako binding MEDIA w wrangler.jsonc i typ Env, z testem zapisu i odczytu. | Dodało `r2_buckets` w `wrangler.jsonc`, pole `MEDIA: R2Bucket` w `worker/shared/index.ts`, test `worker/shared/r2Binding.test.ts` i ten wpis. | Do ustalenia | Szymon Sosnowski |
