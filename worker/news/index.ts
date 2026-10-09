/**
 * PL: Drzwi modułu news po stronie serwera. Tylko zbiera index.ts jego podtorów (3a, 3b, 3c) i niczego nie zawiera. Worker importuje tylko stąd.
 * EN: The door of the news module on the server side. It only collects the index.ts files of its subtracks (3a, 3b, 3c) and contains nothing itself. The Worker imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/news/feed/index.ts::newsFeedApp
 * @uses worker/news/editor/index.ts::newsEditorApp
 * @uses worker/news/admin/index.ts::newsAdminApp
 * @uses worker/news/feed/index.ts::deleteNewsStudentData
 * @used_by worker/mounts.ts::API_MOUNTS
 * @used_by worker/shared/accountDeletion.ts::STUDENT_DATA_DELETERS
 */

// PL: Router podtoru 3a (aktualności: lista i wpis) i funkcja kasująca dane ucznia.
// EN: The router of subtrack 3a (news: list and entry) and the function that deletes student data.
export { newsFeedApp, deleteNewsStudentData } from './feed';

// PL: Router podtoru 3b (edytor wpisów).
// EN: The router of subtrack 3b (entry editor).
export { newsEditorApp } from './editor';

// PL: Router podtoru 3c (wpisy w panelu: publikacja, usuwanie).
// EN: The router of subtrack 3c (entries in the panel: publishing, deleting).
export { newsAdminApp } from './admin';
