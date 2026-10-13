/**
 * PL: Drzwi podtoru 7 (profil i ustawienia) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 7 (profile and settings) on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/profile/routes.ts::profileApp
 * @uses worker/profile/deleteStudentData.ts::deleteProfileStudentData
 * @uses worker/profile/profileRepository.ts::getStudentNames
 * @used_by worker/mounts.ts::API_MOUNTS
 */

// PL: Router podtoru 7.
// EN: The router of subtrack 7.
export { profileApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu profile. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the profile module. worker/shared/accountDeletion.ts collects it.
export { deleteProfileStudentData } from './deleteStudentData';

// PL: Imiona i klasy uczniów z listy numerów kont dla panelu zgłoszeń (podtor 4b, #70). Typ wyniku to { userId, name, className }.
// EN: The names and classes of students from a list of account ids for the reports panel (subtrack 4b, #70). The result type is { userId, name, className }.
export { getStudentNames, type StudentName } from './profileRepository';
