/**
 * PL: Drzwi podtoru 3a (aktualności: lista i wpis) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 3a (news: list and entry) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/news/feed/NewsFeedScreen.tsx::NewsFeedScreen
 * @uses src/features/news/feed/EntryCard.tsx::EntryCard
 * @uses src/features/news/feed/content/RichContent.tsx::RichContent
 * @used_by src/features/news/index.ts::NewsFeedScreen
 * @used_by src/features/news/feed/index.test.tsx::EntryCard
 * @used_by src/features/news/feed/index.test.tsx::RichContent
 */

// PL: Ekran podtoru 3a.
// EN: The screen of subtrack 3a.
export { NewsFeedScreen } from './NewsFeedScreen';

// PL: Kafel wpisu (typ, źródło, chwila, tytuł, opis), rysowany z danych wpisu bez pobierania z serwera. Podgląd w edytorze (podtor 3b) go użyje.
// EN: The entry tile (type, source, moment, title, description), drawn from the entry data without fetching from the server. The editor preview (subtrack 3b) will use it.
export { EntryCard } from './EntryCard';

// PL: Rysowanie treści wpisu z dokumentu JSON po oczyszczeniu. Podgląd w edytorze (podtor 3b) go użyje.
// EN: Drawing the entry content from a JSON document after cleaning. The editor preview (subtrack 3b) will use it.
export { RichContent } from './content/RichContent';
