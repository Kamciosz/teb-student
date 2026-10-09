/**
 * PL: Drzwi podtoru 3a (aktualności: lista i wpis) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts i funkcję kasującą dane ucznia.
 * EN: The door of subtrack 3a (news: list and entry) on the server side. Exposes the router to be mounted in worker/mounts.ts and the function that deletes student data.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/news/feed/routes.ts::newsFeedApp
 * @uses worker/news/feed/deleteStudentData.ts::deleteNewsStudentData
 * @used_by worker/news/index.ts::newsFeedApp
 */

// PL: Router podtoru 3a.
// EN: The router of subtrack 3a.
export { newsFeedApp } from './routes';

// PL: Funkcja kasująca dane ucznia z modułu news. Zbiera ją worker/shared/accountDeletion.ts.
// EN: The function that deletes the student's data from the news module. worker/shared/accountDeletion.ts collects it.
export { deleteNewsStudentData } from './deleteStudentData';
