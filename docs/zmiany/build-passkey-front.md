## Changelog

### Dodane

- Profil, sekcja „Face ID i odcisk palca” w ustawieniach: przycisk „Dodaj Face ID lub odcisk palca”, lista kluczy z nazwą i datą dodania oraz „Usuń” przy każdym kluczu. Gdy przeglądarka nie obsługuje WebAuthn, zostaje jedno zdanie, bez przycisku.
- Ekran logowania kodem z maila: pod formularzem przycisk „Zaloguj Face ID lub odciskiem palca”. Po sukcesie sesja jest odświeżana, a anulowanie nie pokazuje komunikatu. Bez WebAuthn przycisku nie ma.
- Gdy sesja jest za stara (401 albo 403 `SESSION_NOT_FRESH`), profil prosi o ponowne logowanie kodem z maila, zanim doda albo usunie klucz.
- Eksport RODO (`worker/profile/exportData.ts`) zawiera liczbę kluczy i ich nazwy, pobrane przez `listPasskeysForExport`. Klucze kryptograficzne nie trafiają do eksportu.
- Testy Vitest: komunikaty błędów logowania kluczem, przycisk na ekranie logowania, sekcja w ustawieniach, klient profilu (brak sieci, sukces, 401 i 403 `SESSION_NOT_FRESH`), eksport z nazwami kluczy.
- Testy e2e: przycisk logowania widoczny przy WebAuthn i ukryty bez niego, sekcja w ustawieniach z przyciskiem albo ze zdaniem. Podpisu WebAuthn nie testujemy.

### Otwarte

- Ścieżki sukcesu i anulowania WebAuthn nie mają testu jednostkowego, bo wymagają atrapy `navigator.credentials`.
- Sekcja profilu ma własny klient i własną funkcję wykrywającą WebAuthn, bo profil nie importuje `src/features/auth/email`. `src/features/auth/index.ts` nie został rozszerzony.

## Log AI

| Data | Zadanie i pull request | Polecenie dla AI (skrót) | Co zrobiło AI i jakie pliki zmieniło | Co zmienił właściciel | Kto |
|---|---|---|---|---|---|
| 2026-10-14 | build/passkey-front: Face ID i odcisk palca w profilu i na ekranie logowania | Dodaj sekcję kluczy w profilu z dodawaniem i usuwaniem, przycisk logowania pod kodem z maila, komunikaty przy starej sesji, eksport RODO z liczbą i nazwami kluczy; z testami Vitest i e2e. | Dodało `src/features/profile/passkeyApi.ts`, `usePasskeys.ts`, `PasskeySection.tsx` (i testy), zmieniło `SettingsScreen.tsx` i `profile.css`; dodało `src/features/auth/email/PasskeySignIn.tsx` (i test), zmieniło `authApi.ts`, `authMessages.ts` (i test), `AuthEmailScreen.tsx`; zmieniło `worker/profile/exportData.ts` (i test); dopisało testy w `e2e/auth-email.spec.ts` i `e2e/profile.spec.ts`; ten plik i zdanie w `docs/STAN_PRAC.md`. | do uzupełnienia | do uzupełnienia |
