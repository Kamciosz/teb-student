## Changelog

### Zmienione

- Ekran Profil wygląda jak Ustawienia w telefonie: nagłówek „Profil”, litera w kółku, imię i klasa, a pod nimi grupowane listy. Grupa „Konto” pokazuje zasłonięty adres e-mail i wiersz „Ustawienia”. Wiersz panelu widzi tylko osoba z rolą. Dalej są „Moje zgłoszenia” i „Polityka prywatności”, osobno „Wyloguj”, a na dole „Usuń konto i dane” na czerwono, w osobnej grupie.
- Ekran Profil ma dolny pasek nawigacji. Podekrany (Ustawienia, Polityka prywatności, Usuń konto i dane) mają nagłówek z przyciskiem wstecz „Profil” i nie mają paska.
- Ekran potwierdzenia usunięcia konta używa wspólnego przycisku w wariancie na czerwono. Tekst przycisku się nie zmienił.

### Usunięte

- `src/features/profile/ScreenTop.tsx`, zastąpiony wspólnym `ScreenHeader`. Usunięte też nieużywane style górnego paska (`.pf-top`, `.pf-icon-btn`, `.pf-badge`) i funkcja `profileCaption`. Reguły `html[data-tekst='duzy']` zostały.

### Uwagi

- Ekran Ustawienia ma nowy nagłówek, ale treść nadal używa starych kafli (`pf-tile`, `pf-row`, `pf-field`). Przerobienie na grupowane listy to osobna decyzja właściciela.
- Na Profilu nie ma wiersza „Urządzenia i klucze dostępu” (w specyfikacji opcjonalny). „Moje urządzenia” zostają w Ustawieniach.
- Testy e2e (`e2e/profile.spec.ts`): zmienione są tylko selektory. Nagłówek podekranu sprawdzany jest jako `h1` zamiast `b`, link powrotu nazywa się „Profil”, a e-mail i klasa mają osobne asercje. Żadna asercja nie została osłabiona.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-18 | style/ekran-profil | Przerób ekran Profil na wygląd ustawień systemu wg docs/projekt/wyglad-ekranow.md: grupowane listy, ScreenHeader, Dock, podekrany z powrotem do „Profil”. Usuń ScreenTop, jeśli nieużywany. | Przepisało `ProfileHome.tsx`. Zmieniło `SettingsScreen.tsx`, `PrivacyScreen.tsx`, `DeleteAccountScreen.tsx`, `icons.tsx`, `profile.css`, `profileView.ts`, `profileView.test.ts` i `e2e/profile.spec.ts`. Usunęło `ScreenTop.tsx`. Dodało ten plik. | — | Szymon |
