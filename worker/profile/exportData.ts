/**
 * PL: Eksport danych ucznia („Pobierz moje dane”, RODO): numer i adres konta, imię i chwila założenia konta, profil i ustawienia, zgłoszenia ucznia, ankiety, w których wziął udział (bez treści odpowiedzi), oraz klucze Face ID i odcisk palca (liczba i nazwy, bez kluczy kryptograficznych). Każde dane biorą się z drzwi (index.ts) modułu, który je trzyma, i zawsze dotyczą tylko numeru ucznia z sesji. Pole missing wymienia dane, których moduł jeszcze nie wystawia; dziś jest puste.
 * EN: The export of the student's data ("Pobierz moje dane", GDPR): the account id and address, the name and the moment the account was created, the profile and settings, the student's reports and the surveys they took part in (without the content of the answers). Each piece comes through the door (index.ts) of the module that holds it, and always concerns only the student id from the session. The missing field lists the data a module does not expose yet; today it is empty.
 *
 * @author Jakub
 * @since 2026-10-13
 * @uses worker/auth/index.ts::listStudentsByIds
 * @uses worker/auth/index.ts::getAccountCreatedAt
 * @uses worker/auth/index.ts::listPasskeysForExport
 * @uses worker/reports/index.ts::listReportsByAuthor
 * @uses worker/reports/index.ts::MyReport
 * @uses worker/surveys/index.ts::listParticipatedSurveys
 * @uses worker/surveys/index.ts::ParticipatedSurvey
 * @uses worker/profile/profileRepository.ts::getProfile
 * @uses worker/profile/validation.ts::ProfileInput
 * @used_by worker/profile/routes.ts::profileApp
 */

// PL: Konto (numer, imię, chwila założenia) z modułu auth przez jego index.ts.
// EN: The account (id, name, moment of creation) from the auth module through its index.ts.
import { getAccountCreatedAt, listPasskeysForExport, listStudentsByIds } from '../auth';
// PL: Zgłoszenia ucznia z modułu reports przez jego index.ts.
// EN: The student's reports from the reports module through its index.ts.
import { listReportsByAuthor, type MyReport } from '../reports';
// PL: Ankiety, w których uczeń wziął udział, z modułu surveys przez jego index.ts.
// EN: The surveys the student took part in, from the surveys module through its index.ts.
import { listParticipatedSurveys, type ParticipatedSurvey } from '../surveys';
// PL: Profil ucznia i jego typ.
// EN: The student's profile and its type.
import { getProfile } from './profileRepository';
import type { ProfileInput } from './validation';

/** PL: Wersja formatu pliku. EN: The version of the file format. */
const EXPORT_VERSION = 1;

/**
 * PL: Dane, których plik jeszcze nie zawiera. Gdy moduł nie wystawi w index.ts funkcji eksportu, wpisujemy tu, czego brakuje i w którym module. Dziś każdy moduł ją wystawia, więc lista jest pusta.
 * EN: The data the file does not contain yet. When a module does not expose an export function in index.ts, we write here what is missing and in which module. Today every module exposes it, so the list is empty.
 */
const MISSING_DATA: string[] = [];

/** PL: Plik z danymi ucznia, tak jak go dostaje pobierający. EN: The student's data file, as the downloader gets it. */
export type StudentExport = {
  /** PL: Wersja formatu pliku. EN: The version of the file format. */
  version: typeof EXPORT_VERSION;
  /** PL: Chwila wygenerowania pliku (czas ISO). EN: The moment the file was made (ISO time). */
  exportedAt: string;
  /** PL: Konto: numer, adres, imię i chwila założenia (milisekundy od 1970, albo null). EN: The account: id, address, name and the moment it was created (milliseconds since 1970, or null). */
  account: { id: string; email: string; name: string; createdAt: number | null };
  /** PL: Profil i ustawienia, tak jak zapisał je uczeń. EN: The profile and settings, as the student saved them. */
  profile: ProfileInput;
  /** PL: Zgłoszenia ucznia, od najnowszego (daty w milisekundach od 1970). EN: The student's reports, newest first (dates in milliseconds since 1970). */
  reports: MyReport[];
  /** PL: Ankiety, w których uczeń wziął udział, bez treści odpowiedzi. EN: The surveys the student took part in, without the content of the answers. */
  surveys: ParticipatedSurvey[];
  /** PL: Klucze Face ID i odcisk palca: liczba i nazwy (bez kluczy kryptograficznych). EN: The Face ID and fingerprint keys: the count and the names (no cryptographic keys). */
  passkeys: { count: number; names: (string | null)[] };
  /** PL: Opisy danych, których plik nie zawiera. EN: The descriptions of the data the file does not contain. */
  missing: string[];
};

/**
 * PL: Składa plik z danymi ucznia z konta z sesji, jego profilu, zgłoszeń i ankiet.
 * EN: Builds the file with the student's data from the account of the session, their profile, reports and surveys.
 *
 * @param db - PL: baza D1. EN: the D1 database.
 * @param student - PL: numer i adres ucznia z sesji. EN: the student's id and address from the session.
 * @param now - PL: chwila wygenerowania (do testów można podać stałą). EN: the moment of generation (tests may pass a fixed one).
 * @returns PL: dane ucznia do zapisania w pliku JSON. EN: the student's data to save in a JSON file.
 */
export async function exportStudentData(db: D1Database, student: { id: string; email: string }, now: Date = new Date()): Promise<StudentExport> {
  // PL: Wszystkie odczyty idą równolegle i każdy dostaje ten sam numer ucznia z sesji.
  // EN: All reads run in parallel, and each gets the same student id from the session.
  const [students, createdAt, profile, reports, surveys, passkeys] = await Promise.all([
    listStudentsByIds(db, [student.id]),
    getAccountCreatedAt(db, student.id),
    getProfile(db, student.id),
    listReportsByAuthor(db, student.id),
    listParticipatedSurveys(db, student.id),
    listPasskeysForExport(db, student.id),
  ]);

  return {
    version: EXPORT_VERSION,
    exportedAt: now.toISOString(),
    // PL: Imię z konta (puste, gdy konta nie ma w tabeli użytkowników).
    // EN: The name from the account (empty when there is no account in the users table).
    account: { id: student.id, email: student.email, name: students[0]?.name ?? '', createdAt },
    profile,
    reports,
    surveys,
    passkeys,
    missing: MISSING_DATA,
  };
}
