/**
 * PL: Ekran podtoru 3a (aktualności: lista i wpis). Pod adresem /news/feed pokazuje listę, a pod /news/feed/:id jeden wpis. Dostarcza klienta zapytań z zapisem w telefonie, dopóki nie ma wspólnego dostawcy (zgłoszenie #44).
 * EN: The screen of subtrack 3a (news: list and entry). Under /news/feed it shows the list, and under /news/feed/:id one entry. It provides the query client with the on-phone copy until the shared provider exists (issue #44).
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/FeedListScreen.tsx::FeedListScreen
 * @uses src/features/news/feed/EntryScreen.tsx::EntryScreen
 * @uses src/features/news/feed/queryClient.ts::newsQueryClient
 * @used_by src/features/news/feed/index.ts::NewsFeedScreen
 */

// PL: Dostawca zapytań z zapisem w telefonie.
// EN: The query provider with the on-phone copy.
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
// PL: Adresy zagnieżdżone pod /news/feed.
// EN: The addresses nested under /news/feed.
import { Route, Routes } from 'react-router';
// PL: Ekrany podtoru.
// EN: The subtrack screens.
import { EntryScreen } from './EntryScreen';
import { FeedListScreen } from './FeedListScreen';
// PL: Klient zapytań i zapis.
// EN: The query client and the copy.
import { NEWS_PERSIST_MAX_AGE, newsPersister, newsQueryClient } from './queryClient';
// PL: Style ekranów aktualności.
// EN: The styles of the news screens.
import './feed.css';

/**
 * PL: Rysuje ekran podtoru 3a: listę albo wpis, zależnie od adresu.
 * EN: Draws the screen of subtrack 3a: the list or an entry, depending on the address.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function NewsFeedScreen() {
  return (
    <PersistQueryClientProvider client={newsQueryClient} persistOptions={{ persister: newsPersister, maxAge: NEWS_PERSIST_MAX_AGE, buster: 'news-feed-1' }}>
      <Routes>
        <Route index element={<FeedListScreen />} />
        <Route path=":id" element={<EntryScreen />} />
      </Routes>
    </PersistQueryClientProvider>
  );
}
