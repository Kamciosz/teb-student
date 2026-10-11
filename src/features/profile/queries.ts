/**
 * PL: Zapytania TanStack Query dla profilu: odczyt, zapis i usunięcie konta. Odczyt trafia do wspólnej pamięci podręcznej, więc bez internetu ekran pokazuje ostatnio pobrany profil. Pobrany i zapisany profil od razu ustawia wygląd aplikacji.
 * EN: The TanStack Query hooks for the profile: reading, saving and deleting the account. The read goes into the shared cache, so without internet the screen shows the last fetched profile. A fetched and a saved profile immediately set the app look.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/api.ts::fetchProfile
 * @uses src/features/profile/look.ts::applyLook
 * @uses src/shared/index.ts::clearQueryData
 * @used_by src/features/profile/ProfileHome.tsx::useProfile
 * @used_by src/features/profile/SettingsScreen.tsx::useSaveProfile
 * @used_by src/features/profile/DeleteAccountScreen.tsx::useDeleteAccount
 */

// PL: useQuery czyta dane, useMutation je zmienia, useQueryClient daje dostęp do pamięci podręcznej.
// EN: useQuery reads data, useMutation changes it, useQueryClient gives access to the cache.
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
// PL: useEffect uruchamia kod po narysowaniu ekranu.
// EN: useEffect runs code after the screen is drawn.
import { useEffect } from 'react';
// PL: Czyszczenie danych zapisanych w telefonie, ze wspólnej części aplikacji.
// EN: Clearing the data saved on the phone, from the shared part of the app.
import { clearQueryData } from '../../shared';
// PL: Rozmowa z serwerem i wygląd.
// EN: The talk with the server and the look.
import { deleteAccount, fetchProfile, saveProfile, type Profile } from './api';
import { applyLook, resetLook } from './look';

/** PL: Klucz zapytania o profil w pamięci podręcznej. EN: The profile query key in the cache. */
const PROFILE_KEY = ['profile'] as const;

/**
 * PL: Czyta profil ucznia i ustawia wygląd z tego profilu, gdy dane przyjdą (z serwera albo z zapisu w telefonie).
 * EN: Reads the student's profile and sets the look from it when the data arrives (from the server or the saved copy).
 *
 * @returns PL: wynik zapytania z profilem w `data`. EN: the query result with the profile in `data`.
 */
export function useProfile() {
  // PL: Profil jest świeży 30 sekund, żeby wejście na ekran nie pobierało go za każdym razem.
  // EN: The profile is fresh for 30 seconds, so opening the screen does not fetch it every time.
  const query = useQuery({ queryKey: PROFILE_KEY, queryFn: fetchProfile, staleTime: 30_000 });
  const { data } = query;

  // PL: Po nadejściu danych ustaw wygląd z profilu. Serwer jest źródłem prawdy, więc nowy telefon dostaje wygląd konta.
  // EN: When the data arrives, set the look from the profile. The server is the source of truth, so a new phone gets the account's look.
  useEffect(() => {
    if (data) applyLook({ palette: data.palette, school: data.school });
  }, [data]);

  return query;
}

/**
 * PL: Zapis profilu. Po sukcesie wstawia zapisany profil do pamięci podręcznej i od razu zmienia wygląd.
 * EN: Saving the profile. On success it puts the saved profile into the cache and changes the look at once.
 *
 * @returns PL: mutacja z `mutate`, `isPending` i `isError`. EN: a mutation with `mutate`, `isPending` and `isError`.
 */
export function useSaveProfile() {
  // PL: Dostęp do pamięci podręcznej, żeby wstawić zapisany profil.
  // EN: Access to the cache, to put the saved profile in.
  const client = useQueryClient();
  // PL: networkMode „always” wysyła od razu i bez internetu kończy się błędem, zamiast czekać w tle; ekran pokaże błąd.
  // EN: networkMode "always" sends right away and fails without internet instead of waiting in the background; the screen shows the error.
  return useMutation({
    mutationFn: saveProfile,
    networkMode: 'always',
    onSuccess: (saved: Profile) => client.setQueryData(PROFILE_KEY, saved),
  });
}

/**
 * PL: Usunięcie konta. Po sukcesie czyści dane zapisane w telefonie i wraca do wyglądu domyślnego.
 * EN: Deleting the account. On success it clears the data saved on the phone and goes back to the default look.
 *
 * @returns PL: mutacja z `mutate`, `isPending`, `isError` i `isSuccess`. EN: a mutation with `mutate`, `isPending`, `isError` and `isSuccess`.
 */
export function useDeleteAccount() {
  // PL: Bez internetu usunięcie kończy się błędem, a konto zostaje.
  // EN: Without internet the deletion fails and the account stays.
  return useMutation({
    mutationFn: deleteAccount,
    networkMode: 'always',
    onSuccess: () => {
      // PL: Konto nie istnieje, więc najpierw wróć do wyglądu domyślnego, a potem wyczyść zapisane dane (profil, zgłoszenia, sesję). clearQueryData na końcu przenosi na ekran logowania.
      // EN: The account no longer exists, so first go back to the default look, then clear the saved data (profile, reports, session). clearQueryData finally takes the student to the sign-in screen.
      resetLook();
      clearQueryData();
    },
  });
}
