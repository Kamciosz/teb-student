/**
 * PL: Router Hono podtoru 2 (wysyłka zdjęć i filmów). POST /upload zapisuje plik i wymaga roli redaktora w panelu. GET /:id oddaje plik, a GET /:id/meta jego opis; oba wymagają zalogowanego ucznia. Router jest podpięty pod /api/media w worker/mounts.ts.
 * EN: The Hono router of subtrack 2 (photo and video upload). POST /upload saves a file and requires the editor role in the panel. GET /:id returns the file, and GET /:id/meta its description; both require a signed-in student. The router is mounted under /api/media in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-13
 * @uses worker/admin/index.ts::requirePanelRole
 * @uses worker/auth/index.ts::requireStudent
 * @uses worker/db/schema/media.ts::mediaFiles
 * @uses worker/media/rules.ts::kindOfMime
 * @uses worker/media/rules.ts::maxBytesOf
 * @uses worker/media/rules.ts::parseDimensions
 * @uses worker/media/upload.ts::storeMedia
 * @used_by worker/media/index.ts::mediaApp
 * @used_by worker/media/routes.test.ts::mediaApp
 */

// PL: Hono to router serwera.
// EN: Hono is the server router.
import { Hono } from 'hono';
// PL: Drizzle dla bazy D1 i funkcja porównania z tabelą.
// EN: Drizzle for the D1 database and the comparison function for the table.
import { drizzle } from 'drizzle-orm/d1';
import { eq } from 'drizzle-orm';
// PL: Sprawdzanie sesji ucznia i roli w panelu, przez drzwi (worker/auth/index.ts, worker/admin/requirePanelRole.ts).
// EN: The student session check and the panel role check, through the doors (worker/auth/index.ts, worker/admin/requirePanelRole.ts).
import { requireStudent } from '../auth';
import { type PanelEnv, requirePanelRole } from '../admin';
// PL: Tabela plików i reguły przyjmowania.
// EN: The file table and the acceptance rules.
import { mediaFiles } from '../db/schema/media';
import { kindOfMime, maxBytesOf, parseDimensions } from './rules';
// PL: Zapis pliku do R2 i do bazy.
// EN: Saving the file to R2 and the database.
import { storeMedia } from './upload';

/**
 * PL: Router podtoru 2. Bindingi (R2 i D1) są w context.env, a numer ucznia w context.get('student').
 * EN: The router of subtrack 2. The bindings (R2 and D1) are in context.env, and the student id in context.get('student').
 */
export const mediaApp = new Hono<PanelEnv>();

// PL: POST /upload przyjmuje surowe bajty pliku (treść zapytania), a typ i wymiary podaje w nagłówku i w adresie. Tylko redaktor.
// EN: POST /upload takes the raw file bytes (the request body), and gives the type and dimensions in the header and the address. Editors only.
mediaApp.post('/upload', requirePanelRole('editor'), async (context) => {
  // PL: Typ bierzemy bez parametrów (bez „; charset”) i małymi literami.
  // EN: The type is taken without parameters (without "; charset") and in lower case.
  const mime = (context.req.header('content-type') ?? '').split(';')[0].trim().toLowerCase();
  const kind = kindOfMime(mime);
  if (kind === null) return context.json({ error: 'unsupported_type' }, 415);

  // PL: Wymiary są nieobowiązkowe, ale jeśli są, muszą być poprawne.
  // EN: The dimensions are optional, but when given they must be valid.
  const dimensions = parseDimensions(context.req.query('width'), context.req.query('height'));
  if (!dimensions.ok) return context.json({ error: 'invalid_dimensions' }, 400);

  const body = await context.req.arrayBuffer();
  if (body.byteLength === 0) return context.json({ error: 'empty_file' }, 400);

  // PL: Zapis i kontrola rozmiaru po zapisie. Zbyt duży plik zostaje skasowany w funkcji storeMedia.
  // EN: Saving and the size check after saving. A file that is too big is deleted in the storeMedia function.
  const result = await storeMedia({
    bucket: context.env.MEDIA,
    db: context.env.DB,
    body,
    mime,
    kind,
    width: dimensions.width,
    height: dimensions.height,
    uploadedBy: context.get('student').id,
    maxBytes: maxBytesOf(kind),
  });
  if (!result.ok) return context.json({ error: 'too_large' }, 413);
  return context.json({ id: result.id }, 201);
});

// PL: GET /:id oddaje plik z zasobnika R2 z jego typem zawartości. Wymaga zalogowanego ucznia.
// EN: GET /:id returns the file from the R2 bucket with its content type. Requires a signed-in student.
mediaApp.get('/:id', requireStudent, async (context) => {
  const object = await context.env.MEDIA.get(context.req.param('id'));
  if (!object) return context.json({ error: 'not_found' }, 404);
  return new Response(object.body, {
    headers: { 'content-type': object.httpMetadata?.contentType ?? 'application/octet-stream' },
  });
});

// PL: GET /:id/meta oddaje opis pliku z bazy. Nie pokazujemy numeru autora.
// EN: GET /:id/meta returns the file description from the database. The author id is not shown.
mediaApp.get('/:id/meta', requireStudent, async (context) => {
  const row = await drizzle(context.env.DB).select().from(mediaFiles).where(eq(mediaFiles.id, context.req.param('id'))).get();
  if (!row) return context.json({ error: 'not_found' }, 404);
  return context.json({ id: row.id, kind: row.kind, mime: row.mime, size: row.size, width: row.width, height: row.height });
});
