/**
 * PL: Router Hono podtoru 7 (profil i ustawienia). Cztery adresy pod /api/profile: GET oddaje profil ucznia, GET /export oddaje plik z jego danymi, PUT go zapisuje, DELETE usuwa konto razem z danymi. Router jest podpięty w worker/mounts.ts.
 * EN: The Hono router of subtrack 7 (profile and settings). Four routes under /api/profile: GET returns the student's profile, GET /export returns the file with their data, PUT saves it, DELETE deletes the account together with the data. The router is mounted in worker/mounts.ts.
 *
 * @author Jakub
 * @since 2026-10-11
 * @uses worker/auth/index.ts::requireStudent
 * @uses worker/profile/validation.ts::parseProfileInput
 * @uses worker/profile/profileRepository.ts::getProfile
 * @uses worker/profile/profileRepository.ts::saveProfile
 * @uses worker/profile/deleteAccount.ts::deleteAccount
 * @uses worker/profile/exportData.ts::exportStudentData
 * @used_by worker/profile/index.ts::profileApp
 * @used_by worker/profile/profile.test.ts::profileApp
 */

// PL: Hono to router serwera. bodyLimit odrzuca zbyt duże zapytania, zanim je odczytamy.
// EN: Hono is the server router. bodyLimit rejects oversized requests before we read them.
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
// PL: Sprawdzanie sesji ucznia, przez drzwi modułu auth (worker/auth/index.ts).
// EN: The student session check, through the door of the auth module (worker/auth/index.ts).
import { requireStudent, type StudentEnv } from '../auth';
// PL: Usuwanie konta, eksport danych, zapis i odczyt profilu oraz sprawdzanie danych.
// EN: Deleting the account, exporting the data, saving and reading the profile, and checking the data.
import { deleteAccount } from './deleteAccount';
import { exportStudentData } from './exportData';
import { getProfile, saveProfile } from './profileRepository';
import { parseProfileInput } from './validation';

/**
 * PL: Najwięcej bajtów, jakie przyjmuje zapytanie z profilem. Imię i klasa to najwyżej kilkadziesiąt znaków, więc 2 KB to duży zapas.
 * EN: The most bytes a profile request may have. The name and class are at most a few dozen characters, so 2 KB is a large margin.
 */
const MAX_BODY_BYTES = 2 * 1024;

/**
 * PL: Router podtoru 7. Wymaga zalogowanego ucznia (bez sesji odpowiada 401), numer ucznia bierze z sesji, a bazę D1 z `context.env.DB`.
 * EN: The router of subtrack 7. It requires a signed-in student (without a session it answers 401), takes the student id from the session and the D1 database from `context.env.DB`.
 */
export const profileApp = new Hono<StudentEnv>().use(requireStudent);

// PL: GET / oddaje profil ucznia (domyślny, gdy uczeń niczego nie zapisał).
// EN: GET / returns the student's profile (the default one when the student saved nothing).
profileApp.get('/', async (context) => context.json(await getProfile(context.env.DB, context.get('student').id)));

// PL: GET /export oddaje plik JSON z danymi konta i profilu do pobrania („Pobierz moje dane”). Dane bierzemy tylko z sesji.
// EN: GET /export returns a JSON file with the account and profile data to download ("Pobierz moje dane"). The data comes only from the session.
profileApp.get('/export', async (context) => {
  const data = await exportStudentData(context.env.DB, context.get('student'));
  context.header('Content-Disposition', 'attachment; filename="moje-dane-teb.json"');
  return context.json(data);
});

// PL: PUT / zapisuje profil. Zwraca zapisany profil albo 400 z nazwami złych pól.
// EN: PUT / saves the profile. Returns the saved profile or 400 with the names of the bad fields.
profileApp.put('/', bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (context) => context.json({ error: 'payload_too_large' }, 413) }), async (context) => {
  // PL: Odczytaj JSON. Zepsuty JSON to błąd telefonu (400), a nie serwera.
  // EN: Read the JSON. Broken JSON is the phone's error (400), not the server's.
  const body: unknown = await context.req.json().catch(() => undefined);

  // PL: Sprawdź dane. Telefon dostaje nazwy złych pól.
  // EN: Validate the data. The phone gets the names of the bad fields.
  const parsed = parseProfileInput(body);
  if (!parsed.ok) return context.json({ error: 'invalid_profile', fields: parsed.fields }, 400);

  // PL: Zapisz profil ucznia z sesji, a nie tego z treści zapytania.
  // EN: Save the profile of the student from the session, not of the one from the request body.
  await saveProfile(context.env.DB, context.get('student').id, parsed.value);
  return context.json(parsed.value);
});

// PL: DELETE / usuwa konto ucznia z sesji razem z jego danymi. Błąd w którymkolwiek module daje 500, a konto zostaje.
// EN: DELETE / deletes the account of the student from the session together with their data. An error in any module gives 500 and the account stays.
profileApp.delete('/', async (context) => {
  // PL: Skasuj dane ze wszystkich modułów, konto na końcu.
  // EN: Delete the data from all modules, the account last.
  await deleteAccount({ userId: context.get('student').id, db: context.env.DB });
  return context.body(null, 204);
});
