/**
 * PL: Bramka logowania: jedno wspólne miejsce, które rozpoznaje odpowiedź 401 z adresów serwera aplikacji (/api/…) i przenosi ucznia na /auth/email. Ekrany modułów nie obsługują 401 osobno. Bramka stoi na fetch, bo tylko tam widać odpowiedź niezależnie od tego, jaki błąd rzuca moduł (każdy rzuca inny). Wzorzec: interceptor odpowiedzi (axios interceptors, Angular HttpInterceptor).
 * EN: The sign-in gate: one shared place that recognizes a 401 response from the app server addresses (/api/…) and takes the student to /auth/email. Module screens do not handle 401 separately. The gate sits on fetch, because only there the response is visible regardless of which error a module throws (each throws a different one). Pattern: a response interceptor (axios interceptors, Angular HttpInterceptor).
 *
 * @author Szymon
 * @since 2026-10-11
 * @uses src/shared/query/clearQueryData.ts::clearQueryData
 * @used_by src/shared/query/AppQueryProvider.tsx::AppQueryProvider
 * @used_by src/shared/auth/signInGate.test.ts::withSignInGate
 */

// PL: Czyszczenie danych poprzedniego ucznia. Kończy się przeniesieniem na /auth/email.
// EN: Clearing the previous student's data. It ends with the move to /auth/email.
import { clearQueryData } from '../query/clearQueryData';

/**
 * PL: Otoczenie bramki: adres aplikacji, ścieżka otwartego ekranu i reakcja na 401. Wstrzykiwane, żeby test działał bez przeglądarki.
 * EN: The gate's surroundings: the app origin, the path of the open screen and the reaction to a 401. Injected so the test runs without a browser.
 */
export type SignInGateEnv = {
  /** PL: Adres aplikacji, na przykład https://teb.example. EN: The app origin, for example https://teb.example. */
  origin: string;
  /** PL: Ścieżka otwartego ekranu. EN: The path of the open screen. */
  getPathname: () => string;
  /** PL: Co zrobić po 401. EN: What to do after a 401. */
  onUnauthorized: () => void;
};

/**
 * PL: Sprawdza, czy zapytanie idzie do serwera aplikacji (/api/…) poza logowaniem (/api/auth/…). Logowanie samo odpowiada błędami, które ekran kodu pokazuje uczniowi.
 * EN: Checks whether the request goes to the app server (/api/…) other than sign-in (/api/auth/…). Sign-in answers with errors on its own, and the code screen shows them to the student.
 *
 * @param input - PL: adres albo zapytanie przekazane do fetch. EN: the address or request passed to fetch.
 * @param origin - PL: adres aplikacji. EN: the app origin.
 * @returns PL: true, gdy 401 z tego adresu oznacza brak sesji. EN: true when a 401 from this address means no session.
 */
function isGuardedRequest(input: RequestInfo | URL, origin: string): boolean {
  // PL: Zapytanie bywa tekstem, URL albo obiektem Request.
  // EN: A request is a string, a URL or a Request object.
  const raw = typeof input === 'string' ? input : input instanceof URL ? input.href : input.url;
  const url = new URL(raw, origin);
  // PL: Obcy adres (inna domena) nie mówi nic o sesji w tej aplikacji.
  // EN: A foreign address (another domain) says nothing about the session in this app.
  return url.origin === origin && url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth/');
}

/**
 * PL: Otacza fetch bramką: odpowiedź 401 z chronionego adresu wywołuje onUnauthorized, a odpowiedź i tak wraca do wołającego bez zmian. Na ekranach logowania (/auth/…) bramka milczy, żeby nie zapętlić przeniesień.
 * EN: Wraps fetch with the gate: a 401 response from a guarded address triggers onUnauthorized, and the response still returns to the caller unchanged. On the sign-in screens (/auth/…) the gate stays quiet, so redirects do not loop.
 *
 * @param baseFetch - PL: właściwy fetch. EN: the real fetch.
 * @param env - PL: otoczenie bramki. EN: the gate's surroundings.
 * @returns PL: fetch z bramką. EN: fetch with the gate.
 */
export function withSignInGate(baseFetch: typeof fetch, env: SignInGateEnv): typeof fetch {
  return async (input, init) => {
    // PL: Najpierw właściwe zapytanie. Błąd sieci przechodzi dalej bez zmian.
    // EN: The real request first. A network error passes through unchanged.
    const response = await baseFetch(input, init);
    // PL: Tylko 401 z chronionego adresu, i nie na ekranie logowania.
    // EN: Only a 401 from a guarded address, and not on the sign-in screen.
    if (response.status === 401 && !env.getPathname().startsWith('/auth/') && isGuardedRequest(input, env.origin)) env.onUnauthorized();
    return response;
  };
}

/**
 * PL: Włącza bramkę na fetch przeglądarki. Po 401 czyści dane zapisane w telefonie (poprzedni uczeń) i przenosi na /auth/email (to robi clearQueryData).
 * EN: Turns the gate on for the browser's fetch. After a 401 it clears the data saved on the phone (the previous student) and takes the student to /auth/email (clearQueryData does that).
 *
 * @returns PL: funkcja przywracająca właściwy fetch. EN: the function that restores the real fetch.
 */
export function installSignInGate(): () => void {
  const baseFetch = window.fetch;
  // PL: bind, bo fetch wywołany bez window rzuca „Illegal invocation”.
  // EN: bind, because fetch called without window throws "Illegal invocation".
  window.fetch = withSignInGate(baseFetch.bind(window), {
    origin: window.location.origin,
    getPathname: () => window.location.pathname,
    onUnauthorized: () => clearQueryData(),
  });
  return () => {
    window.fetch = baseFetch;
  };
}
