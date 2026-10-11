/**
 * PL: Rozmowa telefonu z serwerem profilu (/api/profile): odczyt i zapis profilu oraz usunięcie konta. Funkcje rzucają błąd przy kodzie innym niż 2xx, a ekran zamienia go na komunikat dla ucznia.
 * EN: The phone's talk with the profile server (/api/profile): reading and saving the profile and deleting the account. The functions throw an error on a code other than 2xx, and the screen turns it into a message for the student.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses src/features/profile/look.ts::Look
 * @used_by src/features/profile/queries.ts::useProfile
 */

// PL: Typy palety i szkoły.
// EN: The palette and school types.
import type { PaletteCode, School } from './look';

/** PL: Adres serwera profilu. EN: The profile server address. */
const API_URL = '/api/profile';

/** PL: Profil ucznia, tak jak go oddaje i przyjmuje serwer. EN: The student's profile, as the server returns and accepts it. */
export type Profile = {
  /** PL: Imię (może być puste). EN: The name (may be empty). */
  name: string;
  /** PL: Klasa, na przykład „3TA” (może być pusta). EN: The class, for example "3TA" (may be empty). */
  className: string;
  /** PL: Szkoła: L albo T. EN: The school: L or T. */
  school: School;
  /** PL: Paleta: CA do CH. EN: The palette: CA to CH. */
  palette: PaletteCode;
};

/**
 * PL: Pobiera profil ucznia.
 * EN: Fetches the student's profile.
 *
 * @returns PL: profil (domyślny, gdy uczeń niczego nie zapisał). EN: the profile (the default one when the student saved nothing).
 * @throws PL: błąd z kodem HTTP, gdy serwer nie odpowie 2xx, albo błąd sieci. EN: an error with the HTTP code when the server does not answer 2xx, or a network error.
 */
export async function fetchProfile(): Promise<Profile> {
  // PL: Pobierz profil metodą GET.
  // EN: Fetch the profile with the GET method.
  const response = await fetch(API_URL);
  // PL: Kod inny niż 2xx to błąd.
  // EN: A code other than 2xx is an error.
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Profile;
}

/**
 * PL: Zapisuje profil ucznia.
 * EN: Saves the student's profile.
 *
 * @param profile - PL: profil do zapisu. EN: the profile to save.
 * @returns PL: profil zapisany przez serwer (po przycięciu spacji). EN: the profile saved by the server (after trimming spaces).
 * @throws PL: błąd z kodem HTTP albo błąd sieci. EN: an error with the HTTP code or a network error.
 */
export async function saveProfile(profile: Profile): Promise<Profile> {
  // PL: Wyślij JSON metodą PUT.
  // EN: Send JSON with the PUT method.
  const response = await fetch(API_URL, { method: 'PUT', headers: { 'content-type': 'application/json' }, body: JSON.stringify(profile) });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return (await response.json()) as Profile;
}

/**
 * PL: Usuwa konto ucznia razem z jego danymi.
 * EN: Deletes the student's account together with their data.
 *
 * @throws PL: błąd z kodem HTTP albo błąd sieci. Przy błędzie konto zostaje. EN: an error with the HTTP code or a network error. On an error the account stays.
 */
export async function deleteAccount(): Promise<void> {
  // PL: Wyślij DELETE. Serwer odpowiada 204 bez treści.
  // EN: Send DELETE. The server answers 204 with no body.
  const response = await fetch(API_URL, { method: 'DELETE' });
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
}
