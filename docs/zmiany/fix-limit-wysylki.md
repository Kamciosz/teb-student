## Changelog

### Poprawione

- Za duży plik jest odrzucany z kodem 413 już przed czytaniem treści i przed zapisem do R2. Długość sprawdzamy z nagłówka Content-Length, a brak nagłówka również daje 413. Serwer dodatkowo sprawdza prawdziwą długość treści, bo nagłówek mógł skłamać, i wtedy nic nie zostaje w R2.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-31 | Limit wielkości wysyłki przed odczytem i zapisem w R2 (gałąź fix/limit-wysylki) | Odrzucać za duży plik 413 przed czytaniem treści i zapisem do R2, sprawdzać Content-Length, dodać test, który na starym kodzie pada. | Zmieniono worker/media/routes.ts (kontrola nagłówka w /upload i /report-photo), worker/media/upload.ts (kontrola bajtów przed put), worker/media/rules.ts (contentLengthFits), testy worker/media/routes.test.ts, upload.test.ts, rules.test.ts, nowy pomocnik worker/shared/countingBucket.ts, ten dokument. | do uzupełnienia | do uzupełnienia |
