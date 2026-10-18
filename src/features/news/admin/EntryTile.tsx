/**
 * PL: Wiersz jednego wpisu na liście panelu w stylu grupowanej listy iOS: tytuł, podpis z typem, źródłem i datą, znaczniki stanu (szkic, do korekty, opublikowany), znacznik „Przypięty” i „Zaplanowany na …” oraz rząd czynności. Szkic ma „Edytuj” i „Opublikuj”, wpis w korekcie ma „Otwórz korektę” (zatwierdza go inny redaktor w kreatorze, podtor 3b), opublikowany ma „Przypnij” albo „Odepnij”. Każdy wpis ma „Usuń”. Wiersz wpisu ucznia (podtor 3a) nie jest wystawiony przez drzwi modułu, więc to własny wiersz panelu, nie podgląd wpisu.
 * EN: The row of one entry on the panel list in the iOS grouped-list style: the title, the subtitle with the type, the source and the date, the state tags (draft, in review or published), the "Przypięty" and "Zaplanowany na …" tags and the row of actions. A draft has "Edytuj" and "Opublikuj", an entry in review has "Otwórz korektę" (another editor approves it in the wizard, subtrack 3b), a published entry has "Przypnij" or "Odepnij". Every entry has "Usuń". The student entry row (subtrack 3a) is not exposed through the module door, so this is the panel's own row, not an entry preview.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/shared/index.ts::Badge
 * @uses src/shared/index.ts::Button
 * @uses src/features/news/admin/schedule.ts::scheduledLabel
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::EntryTile
 */

import { Link } from 'react-router';
import { Badge, Button } from '../../../shared';
import type { PanelEntry } from './api';
import { scheduledLabel } from './schedule';
import { SCREEN, TEXTS } from './texts';

/**
 * PL: Dane wiersza.
 * EN: The row data.
 */
export type EntryTileProps = {
  /** PL: Wpis do pokazania. EN: The entry to show. */
  entry: PanelEntry;
  /** PL: Czy przyciski zapisu są wyłączone (brak internetu albo trwa zapis). EN: Whether the write buttons are off (no internet or a save in progress). */
  isLocked: boolean;
  /** PL: Publikacja szkicu. EN: Publishing the draft. */
  onPublish: () => void;
  /** PL: Przypięcie albo odpięcie opublikowanego wpisu. EN: Pinning or unpinning the published entry. */
  onTogglePin: () => void;
  /** PL: Prośba o usunięcie, po której arkusz pyta o potwierdzenie. EN: A request to delete, after which the sheet asks for confirmation. */
  onDelete: () => void;
};

/**
 * PL: Zamienia chwilę ISO na krótką datę „dzień.miesiąc” w czasie telefonu.
 * EN: Turns an ISO moment into a short "day.month" date in the phone's time.
 *
 * @param iso - PL: chwila jako tekst ISO 8601. EN: the moment as an ISO 8601 string.
 * @returns PL: na przykład „9.10”. EN: for example "9.10".
 */
function shortDate(iso: string): string {
  const date = new Date(iso);
  return `${date.getDate()}.${date.getMonth() + 1}`;
}

/**
 * PL: Zamienia stan wpisu na znacznik w wierszu.
 * EN: Turns the entry state into the tag in the row.
 *
 * @param status - PL: stan wpisu z serwera. EN: the entry state from the server.
 * @returns PL: tekst znacznika. EN: the tag text.
 */
function statusLabel(status: PanelEntry['status']): string {
  // PL: Trzy stany, trzy napisy. Wpis w korekcie nie może wyglądać jak opublikowany.
  // EN: Three states, three labels. An entry in review must not look published.
  if (status === 'draft') return TEXTS.draft;
  return status === 'in_review' ? TEXTS.review : TEXTS.published;
}

/**
 * PL: Rysuje rząd czynności wiersza. Każdy stan ma swoje czynności, a „Usuń” jest zawsze.
 * EN: Draws the row of row actions. Each state has its own actions, and "Usuń" is always there.
 *
 * @param props - PL: wpis i funkcje przycisków. EN: the entry and the button functions.
 * @returns PL: drzewo elementów rzędu. EN: the tree of row elements.
 */
function TileActions({ entry, isLocked, onPublish, onTogglePin, onDelete }: EntryTileProps) {
  // PL: Szkic można edytować i opublikować. Wpis w korekcie tylko otworzyć, bo zmienić go może tylko kreator. Opublikowany można przypiąć albo odpiąć.
  // EN: A draft can be edited and published. An entry in review can only be opened, because only the wizard changes it. A published entry can be pinned or unpinned.
  const pinAction = entry.pinnedAt !== null ? TEXTS.unpin : TEXTS.pin;
  return (
    <div className="na-actions">
      {entry.status === 'draft' ? (
        <>
          <Link className="na-link" to={`/news/editor/${entry.id}`} aria-label={TEXTS.actionName(TEXTS.edit, entry.title)}>
            {TEXTS.edit}
          </Link>
          <Button variant="plain" disabled={isLocked} aria-label={TEXTS.actionName(SCREEN.publish, entry.title)} onClick={onPublish}>
            {SCREEN.publish}
          </Button>
        </>
      ) : null}
      {entry.status === 'in_review' ? (
        <Link className="na-link" to={`/news/editor/${entry.id}`} aria-label={TEXTS.actionName(TEXTS.openReview, entry.title)}>
          {TEXTS.openReview}
        </Link>
      ) : null}
      {entry.status === 'published' ? (
        <Button variant="plain" disabled={isLocked} aria-label={TEXTS.actionName(pinAction, entry.title)} onClick={onTogglePin}>
          {pinAction}
        </Button>
      ) : null}
      <Button variant="destructive" disabled={isLocked} aria-label={TEXTS.actionName(TEXTS.delete, entry.title)} onClick={onDelete}>
        {TEXTS.delete}
      </Button>
    </div>
  );
}

/**
 * PL: Rysuje wiersz wpisu.
 * EN: Draws the entry row.
 *
 * @param props - PL: wpis i funkcje przycisków. EN: the entry and the button functions.
 * @returns PL: drzewo elementów wiersza. EN: the tree of row elements.
 */
export function EntryTile(props: EntryTileProps) {
  const { entry } = props;
  const scheduled = scheduledLabel(entry);
  // PL: Tytuł, podpis z typem i źródłem (szkic nie ma daty), znaczniki stanu, potem rząd czynności.
  // EN: The title, the subtitle with the type and the source (a draft has no date), the state tags, then the row of actions.
  return (
    <li className="na-row">
      <h2 className="na-title">{entry.title}</h2>
      <p className="na-small">
        {SCREEN.types[entry.type] ?? entry.type} · {entry.publishedAt ? `${entry.source} · ${shortDate(entry.publishedAt)}` : entry.source}
      </p>
      <div className="na-badges">
        <Badge>{statusLabel(entry.status)}</Badge>
        {entry.status === 'published' && entry.pinnedAt !== null ? <Badge tone="accent">{TEXTS.pinned}</Badge> : null}
        {scheduled ? <Badge>{scheduled}</Badge> : null}
      </div>
      <TileActions {...props} />
    </li>
  );
}
