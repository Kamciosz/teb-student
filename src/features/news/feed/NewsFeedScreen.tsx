/**
 * PL: Ekran podtoru 3a (aktualności: lista i wpis). Pod adresem /news/feed pokazuje listę, a pod /news/feed/:id jeden wpis. Dane pobiera przez wspólnego dostawcę zapytań z korzenia aplikacji (src/shared), który zapisuje je w telefonie.
 * EN: The screen of subtrack 3a (news: list and entry). Under /news/feed it shows the list, and under /news/feed/:id one entry. It fetches data through the shared query provider at the app root (src/shared), which saves it on the phone.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/FeedListScreen.tsx::FeedListScreen
 * @uses src/features/news/feed/EntryScreen.tsx::EntryScreen
 * @used_by src/features/news/feed/index.ts::NewsFeedScreen
 */

// PL: Adresy zagnieżdżone pod /news/feed.
// EN: The addresses nested under /news/feed.
import { Route, Routes } from 'react-router';
// PL: Ekrany podtoru.
// EN: The subtrack screens.
import { EntryScreen } from './EntryScreen';
import { FeedListScreen } from './FeedListScreen';
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
    <Routes>
      <Route index element={<FeedListScreen />} />
      <Route path=":id" element={<EntryScreen />} />
    </Routes>
  );
}
