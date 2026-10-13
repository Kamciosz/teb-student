/**
 * PL: Ekran „Wpisy” w panelu Samorządu (podtor 3c): lista wszystkich wpisów ze szkicami, publikacja szkicu, usuwanie z potwierdzeniem i przejście do kreatora „Nowy wpis” (podtor 3b, `/news/editor`). Stoi w ramie panelu z menu. Uprawnienia sprawdza serwer, ten ekran tylko pokazuje błąd, gdy serwer odmówi. Bez internetu lista zostaje z ostatnich danych, a publikacja i usuwanie są wyłączone z objaśnieniem.
 * EN: The "Wpisy" screen in the Student Council panel (subtrack 3c): the list of all entries with drafts, publishing a draft, deleting with a confirmation and the way to the "Nowy wpis" wizard (subtrack 3b, `/news/editor`). It stands in the panel frame with the menu. The server checks permissions, this screen only shows an error when the server refuses. Without internet the list stays with the last data, and publishing and deleting are off with an explanation.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/news/admin/queries.ts::usePanelEntries
 * @uses src/features/news/admin/EntryTile.tsx::EntryTile
 * @uses src/features/news/admin/DeleteSheet.tsx::DeleteSheet
 * @used_by src/features/news/admin/index.ts::NewsAdminScreen
 */

import { useState } from 'react';
import { Link } from 'react-router';
import { EntryInReviewError, type PanelEntry } from './api';
import { DeleteSheet } from './DeleteSheet';
import { EntryTile } from './EntryTile';
import { Icon } from './icons';
import './newsAdmin.css';
import { Notice } from './Notice';
import { PanelTop } from './PanelTop';
import { useDeleteEntry, useIsOnline, usePanelEntries, usePublishEntry } from './queries';
import { TO_AGREE } from './texts';

/**
 * PL: Rysuje pusty stan: jeszcze nie ma żadnego wpisu.
 * EN: Draws the empty state: there is no entry yet.
 *
 * @returns PL: drzewo elementów. EN: the tree of elements.
 */
function EmptyState() {
  return (
    <div className="na-empty">
      <Icon name="inbox" />
      <h2>{TO_AGREE.emptyTitle}</h2>
      <p>{TO_AGREE.emptyHint}</p>
    </div>
  );
}

/**
 * PL: Dane listy.
 * EN: The list data.
 */
type EntriesBodyProps = {
  query: ReturnType<typeof usePanelEntries>;
  isLocked: boolean;
  onPublish: (id: string) => void;
  onDelete: (entry: PanelEntry) => void;
};

/**
 * PL: Rysuje treść pod paskiem: listę, pusty stan, błąd albo wczytywanie. Zapisana lista ma pierwszeństwo, więc przy błędzie sieci Samorząd nadal ją widzi.
 * EN: Draws the body under the bar: the list, the empty state, the error or the loading. The saved list takes priority, so with a network error the Student Council still sees it.
 *
 * @param props - PL: wynik zapytania i funkcje przycisków. EN: the query result and the button functions.
 * @returns PL: drzewo elementów treści. EN: the tree of body elements.
 */
function EntriesBody({ query, isLocked, onPublish, onDelete }: EntriesBodyProps) {
  // PL: Dane (z serwera albo z zapisu w telefonie) mają pierwszeństwo nad stanem zapytania.
  // EN: The data (from the server or from the saved copy) takes priority over the query state.
  if (query.data) {
    if (query.data.length === 0) return <EmptyState />;
    return (
      <ul className="na-list" aria-label={TO_AGREE.listLabel}>
        {query.data.map((entry) => (
          <EntryTile key={entry.id} entry={entry} isLocked={isLocked} onPublish={() => onPublish(entry.id)} onDelete={() => onDelete(entry)} />
        ))}
      </ul>
    );
  }
  // PL: Bez danych i z błędem pokaż komunikat (także przy odmowie 403), bez danych i bez błędu zapytanie trwa.
  // EN: Without data and with an error, show the message (also for a 403 refusal), without data and without an error the query is running.
  return query.isError ? <Notice text={TO_AGREE.loadFailed} /> : <div role="status" aria-busy="true" />;
}

/**
 * PL: Dobiera komunikat o nieudanej publikacji. Wpis w korekcie ma osobny tekst, reszta błędów dostaje ogólny.
 * EN: Picks the message for a failed publish. An entry in review has its own text, other errors get the general one.
 *
 * @param error - PL: błąd z publikacji. EN: the publish error.
 * @returns PL: tekst komunikatu. EN: the message text.
 */
function publishErrorText(error: unknown): string {
  return error instanceof EntryInReviewError ? TO_AGREE.inReview : TO_AGREE.publishFailed;
}

/**
 * PL: Rysuje ekran „Wpisy”.
 * EN: Draws the "Wpisy" screen.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function NewsAdminScreen() {
  // PL: Lista z serwera albo z zapisu w telefonie, mutacje i wpis, o którego usunięcie pytamy.
  // EN: The list from the server or from the saved copy, the mutations and the entry whose deletion we ask about.
  const query = usePanelEntries();
  const publish = usePublishEntry();
  const remove = useDeleteEntry();
  const isOnline = useIsOnline();
  const [asked, setAsked] = useState<PanelEntry | null>(null);
  // PL: Przyciski zapisu są wyłączone bez internetu i gdy trwa zapis.
  // EN: The write buttons are off without internet and while a save is in progress.
  const isLocked = !isOnline || publish.isPending || remove.isPending;

  // PL: Pasek, komunikaty błędów zapisu, lista, przycisk „Nowy wpis” z objaśnieniem nad nim i arkusz usuwania.
  // EN: The bar, the save error messages, the list, the "Nowy wpis" button with the explanation above it and the delete sheet.
  return (
    <section className="na-screen" data-subtrack="3c">
      <PanelTop />
      {publish.isError ? <Notice text={publishErrorText(publish.error)} /> : null}
      {remove.isError ? <Notice text={TO_AGREE.deleteFailed} /> : null}
      <EntriesBody query={query} isLocked={isLocked} onPublish={(id) => publish.mutate(id)} onDelete={setAsked} />
      <div className="na-cta">
        {isOnline ? null : <p className="na-small">{TO_AGREE.offlineNote}</p>}
        <Link className="na-btn" to="/news/editor"><Icon name="plus" />{TO_AGREE.newEntry}</Link>
      </div>
      {asked ? (
        <DeleteSheet entry={asked} isDeleting={remove.isPending} onCancel={() => setAsked(null)} onConfirm={() => remove.mutate(asked.id, { onSettled: () => setAsked(null) })} />
      ) : null}
    </section>
  );
}
