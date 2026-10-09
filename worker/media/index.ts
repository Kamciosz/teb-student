/**
 * PL: Drzwi podtoru 2 (wysyłka zdjęć i filmów) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 2 (photo and video upload) on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/media/routes.ts::mediaApp
 * @uses worker/media/deleteStudentData.ts::deleteMediaStudentData
 * @used_by worker/mounts.ts::API_MOUNTS
 */

// PL: Router podtoru 2.
// EN: The router of subtrack 2.
export { mediaApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu media. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the media module. worker/shared/accountDeletion.ts collects it.
export { deleteMediaStudentData } from './deleteStudentData';
