/**
 * PL: Sprawdzanie adresów w treści wpisu: adres https, identyfikator filmu z YouTube (z różnych form adresu) i serwis społecznościowy dla karty linku. Czysty moduł bez Reacta i bez przeglądarki: korzysta z niego telefon (edytor) i serwer (sprawdzanie przed zapisem), więc oba stosują te same zasady (ADR 0002).
 * EN: Address checks in the entry content: an https address, a YouTube video id (from different address forms) and a social network for the link card. A pure module without React and without a browser: the phone (the editor) and the server (the check before saving) both use it, so both apply the same rules (ADR 0002).
 *
 * @author Szymon
 * @since 2026-10-12
 * @used_by src/features/news/editor/document/nodes.ts::socialNetworkName
 * @used_by src/features/news/editor/AddressPanel.tsx::parseYouTubeId
 * @used_by worker/news/editor/validateBody.ts::normalizeHttpsUrl
 * @used_by src/features/news/editor/document/urls.test.ts::parseYouTubeId
 */

// PL: Identyfikator filmu YouTube: dokładnie 11 znaków: litery, cyfry, myślnik i podkreślenie. Taki sam wzór ma czytnik w podtorze 3a.
// EN: A YouTube video id: exactly 11 characters: letters, digits, hyphen and underscore. The reader in subtrack 3a has the same pattern.
export const YOUTUBE_ID_PATTERN = /^[A-Za-z0-9_-]{11}$/;

// PL: Domeny, z których film bierzemy z adresu. Inne domeny nie dają identyfikatora.
// EN: The domains a video is taken from by address. Other domains give no id.
const YOUTUBE_HOSTS = ['youtube.com', 'm.youtube.com', 'www.youtube.com', 'music.youtube.com', 'youtube-nocookie.com', 'www.youtube-nocookie.com'];

// PL: Skrócony adres filmu.
// EN: The short video address host.
const YOUTUBE_SHORT_HOST = 'youtu.be';

// PL: Serwisy z kartą linku (plan, część 3, „Platforma”): domena główna i nazwa, którą pokazuje karta. Subdomeny (www., m.) są dozwolone.
// EN: The networks with a link card (plan, part 3, "Platforma"): the main domain and the name the card shows. Subdomains (www., m.) are allowed.
export const SOCIAL_NETWORKS: readonly { host: string; name: string }[] = [
  { host: 'instagram.com', name: 'Instagram' },
  { host: 'tiktok.com', name: 'TikTok' },
  { host: 'facebook.com', name: 'Facebook' },
  { host: 'x.com', name: 'X' },
  { host: 'twitter.com', name: 'X' },
];

/**
 * PL: Zwraca adres tylko wtedy, gdy jest poprawnym adresem https bez loginu i hasła. Adres przechodzi przez parser URL, więc spacje, znaki sterujące i wielkość liter w „javascript:” nie obchodzą sprawdzenia.
 * EN: Returns the address only when it is a valid https address without a user name and password. The address goes through the URL parser, so spaces, control characters and letter case in "javascript:" cannot get around the check.
 *
 * @param raw - PL: adres z treści wpisu albo z pola formularza. EN: the address from the entry content or from a form field.
 * @returns PL: znormalizowany adres albo null. EN: the normalised address or null.
 */
export function normalizeHttpsUrl(raw: unknown): string | null {
  // PL: Adres musi być tekstem.
  // EN: The address must be a string.
  if (typeof raw !== 'string') return null;
  try {
    // PL: Parser odrzuca śmieci, a protokół i host mówią, czy to zwykły https.
    // EN: The parser rejects garbage, and the protocol and host tell whether it is plain https.
    const url = new URL(raw.trim());
    const isPlainHttps = url.protocol === 'https:' && url.hostname !== '' && url.username === '' && url.password === '';
    return isPlainHttps ? url.href : null;
  } catch {
    // PL: Tekst, który nie jest adresem.
    // EN: A text that is not an address.
    return null;
  }
}

/**
 * PL: Wyciąga identyfikator filmu z adresu YouTube: watch?v=, youtu.be/, /shorts/, /embed/ i /live/. Adres musi być https.
 * EN: Extracts the video id from a YouTube address: watch?v=, youtu.be/, /shorts/, /embed/ and /live/. The address must be https.
 *
 * @param raw - PL: adres wklejony przez redaktora. EN: the address pasted by the editor.
 * @returns PL: 11-znakowy identyfikator albo null. EN: the 11-character id or null.
 */
export function parseYouTubeId(raw: unknown): string | null {
  // PL: Najpierw zwykła kontrola https. Po niej mamy pewny adres, który da się rozłożyć.
  // EN: First the plain https check. After it we have a sure address that can be taken apart.
  const href = normalizeHttpsUrl(raw);
  if (href === null) return null;
  const url = new URL(href);
  // PL: Skrócony adres: identyfikator jest pierwszym segmentem ścieżki.
  // EN: The short address: the id is the first path segment.
  const segments = url.pathname.split('/').filter(Boolean);
  let candidate: string | undefined;
  if (url.hostname === YOUTUBE_SHORT_HOST) candidate = segments[0];
  else if (YOUTUBE_HOSTS.includes(url.hostname)) {
    // PL: Pełny adres: parametr v albo drugi segment po /shorts/, /embed/ lub /live/.
    // EN: A full address: the v parameter or the second segment after /shorts/, /embed/ or /live/.
    const isIdPath = ['shorts', 'embed', 'live'].includes(segments[0] ?? '');
    candidate = isIdPath ? segments[1] : (url.searchParams.get('v') ?? undefined);
  }
  return candidate !== undefined && YOUTUBE_ID_PATTERN.test(candidate) ? candidate : null;
}

/**
 * PL: Zwraca nazwę serwisu społecznościowego dla adresu https albo null, gdy to inna domena.
 * EN: Returns the social network name for an https address, or null when it is another domain.
 *
 * @param raw - PL: adres z karty linku. EN: the address from the link card.
 * @returns PL: nazwa serwisu, na przykład „Instagram”, albo null. EN: the network name, for example "Instagram", or null.
 */
export function socialNetworkName(raw: unknown): string | null {
  // PL: Adres musi być zwykłym https.
  // EN: The address must be plain https.
  const href = normalizeHttpsUrl(raw);
  if (href === null) return null;
  const host = new URL(href).hostname;
  // PL: Domena główna albo jej subdomena (na przykład www.instagram.com), ale nie „fakeinstagram.com”.
  // EN: The main domain or its subdomain (for example www.instagram.com), but not "fakeinstagram.com".
  const network = SOCIAL_NETWORKS.find((item) => host === item.host || host.endsWith(`.${item.host}`));
  return network ? network.name : null;
}
