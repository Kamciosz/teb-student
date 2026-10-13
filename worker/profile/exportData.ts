/**
 * PL: Eksport danych ucznia („Pobierz moje dane”, RODO): numer i adres konta, imię z konta oraz profil i ustawienia. Zgłoszeń i udziałów w ankietach nie ma, bo moduły reports i surveys nie wystawiają w index.ts funkcji, która zwraca dane jednego ucznia (countReports i countSurveyParticipations liczą wszystkich). Zamiast nich plik wymienia, czego brakuje, w polu missing.
 * EN: The export of the student's data ("Pobierz moje dane", GDPR): the account id and address, the name from the account, and the profile and settings. There are no reports or survey participations, because the reports and surveys modules do not expose in index.ts a function that returns one student's data (countReports and countSurveyParticipations count everyone). Instead the file lists what is missing in the missing field.
 *
 * @author Jakub
 * @since 2026-10-13
 * @uses worker/auth/index.ts::listStudentsByIds
 * @uses worker/profile/profileRepository.ts::getProfile
 * @uses worker/profile/validation.ts::ProfileInput
 * @used_by worker/profile/routes.ts::profileApp
 */

// PL: Imię i numer konta z modułu auth (przez jego index.ts).
// EN: The name and the account id from the auth module (through its index.ts).
import { listStudentsByIds } from '../auth';
// PL: Profil ucznia i jego typ.
// EN: The student's profile and its type.
import { getProfile } from './profileRepository';
import type { ProfileInput } from './validation';

/** PL: Wersja formatu pliku. EN: The version of the file format. */
const EXPORT_VERSION = 1;

/**
 * PL: Dane, których plik jeszcze nie zawiera. Każdy wpis mówi, czego brakuje i w którym module, żeby było widać, co dopisać po dodaniu funkcji do index.ts.
 * EN: The data the file does not contain yet. Each entry says what is missing and in which module, so it is clear what to add once the function is in index.ts.
 */
const MISSING_DATA = [
  'Zgłoszenia ucznia: moduł reports nie wystawia w index.ts listy zgłoszeń jednego ucznia.',
  'Udziały w ankietach: moduł surveys nie wystawia w index.ts listy udziałów jednego ucznia.',
  'Data założenia konta: moduł auth nie wystawia w index.ts daty utworzenia konta.',
];

/** PL: Plik z danymi ucznia, tak jak go dostaje pobierający. EN: The student's data file, as the downloader gets it. */
export type StudentExport = {
  /** PL: Wersja formatu pliku. EN: The version of the file format. */
  version: typeof EXPORT_VERSION;
  /** PL: Chwila wygenerowania pliku (czas ISO). EN: The moment the file was made (ISO time). */
  exportedAt: string;
  /** PL: Konto: numer, adres i imię z konta (może być puste). EN: The account: id, address and the name from the account (may be empty). */
  account: { id: string; email: string; name: string };
  /** PL: Profil i ustawienia, tak jak zapisał je uczeń. EN: The profile and settings, as the student saved them. */
  profile: ProfileInput;
  /** PL: Opisy danych, których plik nie zawiera. EN: The descriptions of the data the file does not contain. */
  missing: string[];
};

/**
 * PL: Składa plik z danymi ucznia z konta z sesji i jego profilu.
 * EN: Builds the file with the student's data from the account of the session and their profile.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param student - PL: numer i adres ucznia z sesji. EN: the student's id and address from the session.
 * @param now - PL: chwila wygenerowania (do testów można podać stałą). EN: the moment of generation (tests may pass a fixed one).
 * @returns PL: dane ucznia do zapisania w pliku JSON. EN: the student's data to save in a JSON file.
 */
export async function exportStudentData(db: D1Database, student: { id: string; email: string }, now: Date = new Date()): Promise<StudentExport> {
  // PL: Imię z konta (puste, gdy konta nie ma w tabeli użytkowników), profil z modułu.
  // EN: The name from the account (empty when there is no account in the users table), the profile from the module.
  const [account] = await listStudentsByIds(db, [student.id]);
  const profile = await getProfile(db, student.id);
  return {
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    account: { id: student.id, email: student.email, name: account?.name ?? '' },
    profile,
    missing: MISSING_DATA,
  };
}
