/**
 * PL: Kafel jednego wpisu na liście panelu: znacznik typu, znacznik stanu (szkic, do korekty albo opublikowany), znacznik „Zaplanowany na …”, źródło z datą, tytuł i przyciski. Szkic ma „Edytuj” i „Opublikuj”, wpis w korekcie ma „Otwórz korektę” (zatwierdza go inny redaktor w kreatorze, podtor 3b), opublikowany ma „Przypnij” albo „Odepnij”. Każdy wpis ma „Usuń”. Kafel wpisu ucznia (podtor 3a) nie jest wystawiony przez drzwi modułu, więc to własny kafel panelu, nie podgląd wpisu.
 * EN: The tile of one entry on the panel list: the type tag, the status tag (draft, in review or published), the "Zaplanowany na …" tag, the source with the date, the title and the buttons. A draft has "Edytuj" and "Opublikuj", an entry in review has "Otwórz korektę" (another editor approves it in the wizard, subtrack 3b), a published entry has "Przypnij" or "Odepnij". Every entry has "Usuń". The student entry tile (subtrack 3a) is not exposed through the module door, so this is the panel's own tile, not an entry preview.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/admin/icons.tsx::Icon
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::EntryTile
 */

import { Link } from 'react-router';
import type { PanelEntry } from './api';
import { Icon } from './icons';
import { scheduledLabel } from './schedule';
import { SCREEN, TO_AGREE } from './texts';

/**
 * PL: Dane kafla.
 * EN: The tile data.
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
 * PL: Zamienia stan wpisu na znacznik na kaflu.
 * EN: Turns the entry state into the tag on the tile.
 *
 * @param status - PL: stan wpisu z serwera. EN: the entry state from the server.
 * @returns PL: tekst znacznika. EN: the tag text.
 */
function statusLabel(status: PanelEntry['status']): string {
  // PL: Trzy stany, trzy napisy. Wpis w korekcie nie może wyglądać jak opublikowany.
  // EN: Three states, three labels. An entry in review must not look published.
  if (status === 'draft') return TO_AGREE.draft;
  return status === 'in_review' ? TO_AGREE.review : TO_AGREE.published;
}

/**
 * PL: Rysuje rząd przycisków kafla. Każdy stan ma swoje czynności, a „Usuń” jest zawsze.
 * EN: Draws the row of tile buttons. Each state has its own actions, and "Usuń" is always there.
 *
 * @param props - PL: wpis i funkcje przycisków. EN: the entry and the button functions.
 * @returns PL: drzewo elementów rzędu. EN: the tree of row elements.
 */
function TileActions({ entry, isLocked, onPublish, onTogglePin, onDelete }: EntryTileProps) {
  // PL: Szkic można edytować i opublikować. Wpis w korekcie tylko otworzyć, bo zmienić go może tylko kreator. Opublikowany można przypiąć albo odpiąć.
  // EN: A draft can be edited and published. An entry in review can only be opened, because only the wizard changes it. A published entry can be pinned or unpinned.
  const pinAction = entry.pinnedAt !== null ? TO_AGREE.unpin : TO_AGREE.pin;
  return (
    <div className="na-actions">
      {entry.status === 'draft' ? (
        <>
          <Link className="na-btn na-btn-outline" to={`/news/editor/${entry.id}`} aria-label={TO_AGREE.actionName(TO_AGREE.edit, entry.title)}>
            <Icon name="pencil" />{TO_AGREE.edit}
          </Link>
          <button type="button" className="na-btn" disabled={isLocked} aria-label={TO_AGREE.actionName(SCREEN.publish, entry.title)} onClick={onPublish}>
            <Icon name="send" />{SCREEN.publish}
          </button>
        </>
      ) : null}
      {entry.status === 'in_review' ? (
        <Link className="na-btn na-btn-outline" to={`/news/editor/${entry.id}`} aria-label={TO_AGREE.actionName(TO_AGREE.openReview, entry.title)}>
          <Icon name="pencil" />{TO_AGREE.openReview}
        </Link>
      ) : null}
      {entry.status === 'published' ? (
        <button type="button" className="na-btn na-btn-outline" disabled={isLocked} aria-label={TO_AGREE.actionName(pinAction, entry.title)} onClick={onTogglePin}>
          <Icon name="pin" />{pinAction}
        </button>
      ) : null}
      <button type="button" className="na-btn na-btn-outline" disabled={isLocked} aria-label={TO_AGREE.actionName(TO_AGREE.delete, entry.title)} onClick={onDelete}>
        <Icon name="trash-2" />{TO_AGREE.delete}
      </button>
    </div>
  );
}

/**
 * PL: Rysuje kafel wpisu.
 * EN: Draws the entry tile.
 *
 * @param props - PL: wpis i funkcje przycisków. EN: the entry and the button functions.
 * @returns PL: drzewo elementów kafla. EN: the tree of tile elements.
 */
export function EntryTile(props: EntryTileProps) {
  const { entry } = props;
  const scheduled = scheduledLabel(entry);
  // PL: Znaczniki, źródło z datą (szkic nie ma daty), tytuł i rząd przycisków.
  // EN: The tags, the source with the date (a draft has no date), the title and the row of buttons.
  return (
    <li className="na-tile">
      <div className="na-tile-head">
        <span className="na-tag">{SCREEN.types[entry.type] ?? entry.type}</span>
        <span className="na-tag na-tag-status">{statusLabel(entry.status)}</span>
        {scheduled && <span className="na-tag">{scheduled}</span>}
        <span className="na-small">{entry.publishedAt ? `${entry.source} · ${shortDate(entry.publishedAt)}` : entry.source}</span>
      </div>
      <h2 className="na-title">{entry.title}</h2>
      <TileActions {...props} />
    </li>
  );
}
