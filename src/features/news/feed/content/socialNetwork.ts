/**
 * PL: Nazwa serwisu społecznościowego wyliczona z domeny adresu (karta linku w czytniku). Lista jest taka sama jak w edytorze (src/features/news/editor/document/urls.ts), bo czytnik nie importuje z edytora. Serwer odrzuca inne domeny, a telefon też nie pokazuje karty dla obcej domeny.
 * EN: The name of a social network worked out from the address domain (the link card in the reader). The list is the same as in the editor (src/features/news/editor/document/urls.ts), because the reader does not import from the editor. The server rejects other domains, and the phone does not show a card for a foreign domain either.
 *
 * @author Szymon
 * @since 2026-10-14
 * @uses src/features/news/editor/document/urls.ts::SOCIAL_NETWORKS
 * @used_by src/features/news/feed/content/sanitize.ts::sanitizeLinkCard
 * @used_by src/features/news/feed/content/LinkCard.test.tsx::RichContent
 */

// PL: Serwisy z kartą linku: domena główna i nazwa, którą pokazuje karta. Subdomeny (www., m.) też są dozwolone.
// EN: The networks with a link card: the main domain and the name the card shows. Subdomains (www., m.) are allowed too.
const SOCIAL_NETWORKS: readonly { host: string; name: string }[] = [
  { host: 'instagram.com', name: 'Instagram' },
  { host: 'tiktok.com', name: 'TikTok' },
  { host: 'facebook.com', name: 'Facebook' },
  { host: 'x.com', name: 'X' },
  { host: 'twitter.com', name: 'X' },
];

/**
 * PL: Zwraca nazwę serwisu dla nazwy hosta albo null, gdy to inna domena.
 * EN: Returns the network name for a host name, or null when it is another domain.
 *
 * @param hostname - PL: nazwa hosta z adresu https, na przykład „www.instagram.com”. EN: the host name from an https address, for example "www.instagram.com".
 * @returns PL: nazwa serwisu, na przykład „Instagram”, albo null. EN: the network name, for example "Instagram", or null.
 */
export function socialNetworkName(hostname: string): string | null {
  // PL: Domena główna albo jej subdomena, ale nie „fakeinstagram.com”: wymagana jest kropka przed domeną.
  // EN: The main domain or its subdomain, but not "fakeinstagram.com": a dot before the domain is required.
  const network = SOCIAL_NETWORKS.find((item) => hostname === item.host || hostname.endsWith(`.${item.host}`));
  return network ? network.name : null;
}
