/**
 * PL: Drzwi podtoru 3a (aktualności: lista i wpis) po stronie telefonu. Wystawia ekran dla routera. Inne moduły importują tylko stąd.
 * EN: The door of subtrack 3a (news: list and entry) on the phone side. Exposes the screen to the router. Other modules import only from here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/news/feed/NewsFeedScreen.tsx::NewsFeedScreen
 * @used_by src/features/news/index.ts::NewsFeedScreen
 */

// PL: Ekran podtoru 3a.
// EN: The screen of subtrack 3a.
export { NewsFeedScreen } from './NewsFeedScreen';
