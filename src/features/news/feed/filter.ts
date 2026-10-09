/**
 * PL: Filtr listy aktualności po typie wpisu. Wybór „Wszystkie” pokazuje wszystko.
 * EN: The news list filter by entry type. The "Wszystkie" (all) choice shows everything.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/types.ts::NewsType
 * @used_by src/features/news/feed/FeedListScreen.tsx::filterEntries
 * @used_by src/features/news/feed/filter.test.ts::filterEntries
 */

// PL: Typy wpisów.
// EN: The entry types.
import type { NewsEntrySummary, NewsType } from './types';

/**
 * PL: Wybór filtra: wszystkie albo jeden typ.
 * EN: A filter choice: all or one type.
 */
export type TypeFilter = NewsType | 'all';

/**
 * PL: Zostawia wpisy wybranego typu.
 * EN: Keeps the entries of the chosen type.
 *
 * @param entries - PL: wpisy z serwera. EN: the entries from the server.
 * @param filter - PL: wybór filtra. EN: the filter choice.
 * @returns PL: wpisy po filtrze, w tej samej kolejności. EN: the filtered entries in the same order.
 */
export function filterEntries(entries: NewsEntrySummary[], filter: TypeFilter): NewsEntrySummary[] {
  return filter === 'all' ? entries : entries.filter((entry) => entry.type === filter);
}
