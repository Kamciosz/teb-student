/**
 * PL: Kafel jednego wpisu na liście panelu: znacznik typu, znacznik stanu (szkic albo opublikowany), źródło z datą, tytuł i przyciski „Opublikuj” (tylko szkic), „Przypnij” / „Odepnij” (tylko opublikowany) oraz „Usuń”. Kafel wpisu ucznia (podtor 3a) nie jest wystawiony przez drzwi modułu, więc to własny kafel panelu, nie podgląd wpisu.
 * EN: The tile of one entry on the panel list: the type tag, the status tag (draft or published), the source with the date, the title and the "Opublikuj" (draft only), "Przypnij" / "Odepnij" (published only) and "Usuń" buttons. The student entry tile (subtrack 3a) is not exposed through the module door, so this is the panel's own tile, not an entry preview.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/admin/icons.tsx::Icon
 * @used_by src/features/news/admin/NewsAdminScreen.tsx::EntryTile
 */

import { Link } from 'react-router';
import type { PanelEntry } from './api';
import { Icon } from './icons';
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
 * PL: Rysuje kafel wpisu.
 * EN: Draws the entry tile.
 *
 * @param props - PL: wpis i funkcje przycisków. EN: the entry and the button functions.
 * @returns PL: drzewo elementów kafla. EN: the tree of tile elements.
 */
export function EntryTile({ entry, isLocked, onPublish, onTogglePin, onDelete }: EntryTileProps) {
  const isDraft = entry.status === 'draft';
  const isPinned = entry.pinnedAt !== null;
  const pinAction = isPinned ? TO_AGREE.unpin : TO_AGREE.pin;
  // PL: Znaczniki, źródło z datą (szkic nie ma daty), tytuł i rząd przycisków.
  // EN: The tags, the source with the date (a draft has no date), the title and the row of buttons.
  return (
    <li className="na-tile">
      <div className="na-tile-head">
        <span className="na-tag">{SCREEN.types[entry.type] ?? entry.type}</span>
        <span className="na-tag na-tag-status">{isDraft ? TO_AGREE.draft : TO_AGREE.published}</span>
        <span className="na-small">{entry.publishedAt ? `${entry.source} · ${shortDate(entry.publishedAt)}` : entry.source}</span>
      </div>
      <h2 className="na-title">{entry.title}</h2>
      <div className="na-actions">
        {/* PL: Szkic można edytować i opublikować, opublikowany można przypiąć albo odpiąć. EN: A draft can be edited and published, a published entry can be pinned or unpinned. */}
        {isDraft ? (
          <>
            <Link className="na-btn na-btn-outline" to={`/news/editor/${entry.id}`} aria-label={TO_AGREE.actionName(TO_AGREE.edit, entry.title)}>
              <Icon name="pencil" />{TO_AGREE.edit}
            </Link>
            <button type="button" className="na-btn" disabled={isLocked} aria-label={TO_AGREE.actionName(SCREEN.publish, entry.title)} onClick={onPublish}>
              <Icon name="send" />{SCREEN.publish}
            </button>
          </>
        ) : (
          <button type="button" className="na-btn na-btn-outline" disabled={isLocked} aria-label={TO_AGREE.actionName(pinAction, entry.title)} onClick={onTogglePin}>
            <Icon name="pin" />{pinAction}
          </button>
        )}
        <button type="button" className="na-btn na-btn-outline" disabled={isLocked} aria-label={TO_AGREE.actionName(TO_AGREE.delete, entry.title)} onClick={onDelete}>
          <Icon name="trash-2" />{TO_AGREE.delete}
        </button>
      </div>
    </li>
  );
}
