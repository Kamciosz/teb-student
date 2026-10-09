/**
 * PL: Drzwi modułu news po stronie telefonu. Tylko zbiera index.ts jego podtorów (3a, 3b, 3c) i niczego nie zawiera. Router importuje tylko stąd.
 * EN: The door of the news module on the phone side. It only collects the index.ts files of its subtracks (3a, 3b, 3c) and contains nothing itself. The router imports only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/news/feed/index.ts::NewsFeedScreen
 * @uses src/features/news/editor/index.ts::NewsEditorScreen
 * @uses src/features/news/admin/index.ts::NewsAdminScreen
 * @used_by src/app/routes.ts::APP_ROUTES
 */

// PL: Ekran podtoru 3a (aktualności: lista i wpis).
// EN: The screen of subtrack 3a (news: list and entry).
export { NewsFeedScreen } from './feed';

// PL: Ekran podtoru 3b (edytor wpisów).
// EN: The screen of subtrack 3b (entry editor).
export { NewsEditorScreen } from './editor';

// PL: Ekran podtoru 3c (wpisy w panelu: publikacja, usuwanie).
// EN: The screen of subtrack 3c (entries in the panel: publishing, deleting).
export { NewsAdminScreen } from './admin';
