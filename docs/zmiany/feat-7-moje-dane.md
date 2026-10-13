## Changelog

### Dodane

- Ustawienia: przełącznik „Większy tekst”. Zapisuje się na serwerze razem z imieniem, klasą, szkołą i paletą. Po zapisie powiększa litery w całej aplikacji (atrybut `data-tekst` na `<html>`) i zostaje w telefonie, także bez internetu. Reguła powiększenia jest w `src/features/profile/profile.css`, więc `src/shared` i `tokens.css` nie są zmienione.
- Ustawienia: przycisk „Pobierz moje dane” pobiera plik `moje-dane-teb.json`. Plik zawiera numer i adres konta, imię z konta, profil i ustawienia oraz listę danych, których jeszcze nie ma. Serwer oddaje go pod `GET /api/profile/export` za `requireStudent`, bez sesji daje 401.
- Plik zawiera tylko dane zalogowanego ucznia. Test sprawdza, że w pliku Jana nie ma imienia, adresu ani numeru konta Anny.
- Błąd pobierania pokazuje komunikat „Nie udało się pobrać danych.” i nic się nie zapisuje.

### Brakujące w innych modułach

Plik „Pobierz moje dane” nie zawiera tych danych, bo moduły nie wystawiają ich w `index.ts`. Moduł profilu nie zmienia innych modułów. Po dodaniu funkcji do ich `index.ts` dopisze się je w `worker/profile/exportData.ts`:

- Zgłoszenia ucznia: `worker/reports/index.ts` ma tylko `countReports`, który liczy zgłoszenia wszystkich uczniów.
- Udziały w ankietach: `worker/surveys/index.ts` ma tylko `countSurveyParticipations`, który liczy udziały wszystkich uczniów.
- Data założenia konta: `worker/auth/index.ts` nie wystawia daty utworzenia konta.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-13 | Podtor 7: moje dane i większy tekst | Dodaj przełącznik „Większy tekst” zapisywany z profilem i stosowany w całej aplikacji oraz „Pobierz moje dane” (JSON z kontem i profilem, bez danych innych uczniów); z testami. | Dodało przełącznik i jego logikę w `src/features/profile/` (`textSize.ts`, `SettingsScreen.tsx`, `profile.css`, `api.ts`), pole `textSize` w `worker/db/schema/profile.ts` i walidacji, eksport w `worker/profile/exportData.ts` i trasę w `routes.ts`, testy Vitest (`textSize.test.ts`, `exportData.test.ts`) oraz test Playwright w `e2e/profile.spec.ts` i ten plik. | do uzupełnienia | do uzupełnienia |
