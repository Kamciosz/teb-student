/**
 * PL: Drzwi podtoru 3b (edytor wpisów) po stronie serwera. Wystawia router do podpięcia w worker/mounts.ts oraz to, czego potrzebuje podtor 3c (wpisy w panelu): sprawdzanie wpisu i treści schematem oraz strażnika autora wpisów.
 * EN: The door of subtrack 3b (entry editor) on the server side. Exposes the router to be mounted in worker/mounts.ts and what subtrack 3c (entries in the panel) needs: the schema check of an entry and its content, and the entry author guard.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/news/editor/routes.ts::newsEditorApp
 * @uses worker/news/editor/validateEntry.ts::validateEntry
 * @uses worker/news/editor/validateBody.ts::validateBody
 * @uses worker/news/editor/author.ts::requireNewsAuthor
 * @used_by worker/news/index.ts::newsEditorApp
 * @used_by worker/news/admin/…::requireNewsAuthor (podtor 3c / subtrack 3c)
 */

// PL: Router podtoru 3b.
// EN: The router of subtrack 3b.
export { newsEditorApp } from './routes';

// PL: Sprawdzanie wpisu (typ, tytuł, stan, treść) i samej treści schematem. Podtor 3c używa ich przy każdym zapisie treści od telefonu, żeby do bazy nie trafił dokument spoza listy dozwolonych elementów.
// EN: The check of an entry (type, title, status, content) and of the content alone against the schema. Subtrack 3c uses them on every write of content from the phone, so a document outside the allowed element list never reaches the database.
export { validateEntry, type CheckedEntry, type EntryRejection, type EntryResult } from './validateEntry';
export { validateBody, type BodyRejection, type BodyResult } from './validateBody';

// PL: Strażnik zapisu wpisów: sesja, a potem rola autora (do czasu ról z podtoru 8 zamyka zapis każdemu). Podtor 3c wiesza go na swoich adresach zapisu i usuwania.
// EN: The entry write guard: a session, then the author role (until the roles from subtrack 8 exist it closes writing to everyone). Subtrack 3c puts it on its write and delete routes.
export { requireNewsAuthor } from './author';
