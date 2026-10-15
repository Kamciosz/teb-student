/**
 * PL: Strażnik zdjęć zgłoszeń dla GET /:id i GET /:id/meta. Zdjęcie zgłoszenia oddaje tylko jego autorowi albo administracji (rola council lub wyższa). Każdemu innemu odpowiada jak za brakujący plik (404 bez treści o zdjęciu), więc nie zdradza, że plik istnieje. Pozostałe pliki przechodzą bez zmian.
 * EN: The guard of report photos for GET /:id and GET /:id/meta. A report photo is given only to its author or the administration (council role or higher). Anyone else gets the same answer as for a missing file (404 without anything about the photo), so it does not reveal that the file exists. Other files pass unchanged.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses worker/reports/index.ts::isReportPhoto
 * @uses worker/admin/index.ts::requirePanelRole
 * @uses worker/media/findOwner.ts::findMediaOwner
 * @used_by worker/media/routes.ts::mediaApp
 */

// PL: Typ middleware Hono i typy środowiska routera.
// EN: The Hono middleware type and the router environment type.
import type { MiddlewareHandler } from 'hono';
import { type PanelEnv, requirePanelRole } from '../admin';
// PL: Sprawdzenie, czy plik jest zdjęciem zgłoszenia, przez drzwi modułu reports.
// EN: The check whether a file is a report photo, through the door of the reports module.
import { isReportPhoto } from '../reports';
// PL: Numer autora pliku.
// EN: The author id of the file.
import { findMediaOwner } from './findOwner';

/**
 * PL: Middleware po sprawdzeniu sesji ucznia. Działa na trasach z parametrem :id. Gdy parametru brak (nie zdarza się na tych trasach), numer jest pusty i nic nie pasuje.
 * EN: The middleware after the student session check. It works on routes with the :id parameter. When the parameter is missing (it does not happen on these routes), the id is empty and nothing matches.
 */
export const guardReportPhoto: MiddlewareHandler<PanelEnv> = async (context, next) => {
  const fileId = context.req.param('id') ?? '';

  // PL: Zwykły plik, nie zdjęcie zgłoszenia: przepuść bez zmian.
  // EN: An ordinary file, not a report photo: let it through unchanged.
  if (!(await isReportPhoto(context.env.DB, fileId))) return next();

  // PL: Autor zdjęcia dostaje je zawsze.
  // EN: The author of the photo always gets it.
  const owner = await findMediaOwner(context.env.DB, fileId);
  if (owner === context.get('student').id) return next();

  // PL: Administracja to rola council albo wyższa. Używamy tego samego sprawdzenia co w panelu, ale nie wpinamy go jako middleware trasy: odmowa 403 zdradziłaby, że plik istnieje. Tu tylko czytamy, czy przeszło.
  // EN: The administration is the council role or higher. We use the same check as in the panel, but do not mount it as the route middleware: a 403 refusal would reveal that the file exists. Here we only read whether it passed.
  let isAdministration = false;
  await requirePanelRole('council')(context, async () => {
    isAdministration = true;
  });
  if (isAdministration) return next();

  // PL: Odpowiedź jak za brakujący plik.
  // EN: The answer the same as for a missing file.
  return context.json({ error: 'not_found' }, 404);
};
