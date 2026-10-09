/// <reference types="vite/client" />
/**
 * PL: Wysyłka kodu logowania. Do czasu konta Cloudflare i testu maili (20.10) kod wypisuje się tylko w terminalu serwera deweloperskiego. W produkcji nie ma nadawcy, więc serwer odmawia wysyłki zamiast udawać, że kod poszedł.
 * EN: Sending the sign-in code. Until the Cloudflare account and the mail test (20.10), the code is printed only in the dev server terminal. In production there is no sender, so the server refuses to send instead of pretending the code went out.
 *
 * @author Szymon
 * @since 2026-10-09
 * @used_by worker/auth/email/runtimeAuth.ts::getRuntimeAuth
 * @used_by worker/auth/email/createAuth.ts::CreateAuthOptions
 */

/**
 * PL: Wiadomość z kodem do wysłania.
 * EN: A message with a code to send.
 */
export type CodeMessage = {
  /** PL: Adres szkolny odbiorcy, już po normalizacji. EN: The recipient's school address, already normalized. */
  email: string;
  /** PL: Kod logowania (6 cyfr). EN: The sign-in code (6 digits). */
  code: string;
};

/**
 * PL: Funkcja, która dostarcza kod uczniowi. Przy błędzie rzuca wyjątek.
 * EN: A function that delivers the code to the student. It throws on failure.
 */
export type CodeSender = (message: CodeMessage) => Promise<void>;

/**
 * PL: Ustawienia nadawcy kodu.
 * EN: Code sender settings.
 */
export type CodeSenderOptions = {
  /** PL: Prawda tylko w serwerze deweloperskim i w testach (import.meta.env.DEV). EN: True only in the dev server and in tests (import.meta.env.DEV). */
  isDev: boolean;
  /** PL: Gdzie wypisać kod w trybie deweloperskim. Domyślnie terminal serwera. EN: Where to print the code in dev mode. The server terminal by default. */
  print?: (line: string) => void;
};

/**
 * PL: Tworzy nadawcę kodu. W trybie deweloperskim wypisuje kod w terminalu. Poza nim zwraca null, bo prawdziwa wysyłka (Cloudflare Email Service, zapas Resend) czeka na konto Cloudflare.
 * EN: Creates the code sender. In dev mode it prints the code in the terminal. Outside dev it returns null, because the real delivery (Cloudflare Email Service, Resend as a fallback) waits for the Cloudflare account.
 *
 * @param options - PL: tryb deweloperski i miejsce wypisania. EN: dev mode and where to print.
 * @returns PL: nadawca albo null, gdy wysyłka nie jest skonfigurowana. EN: a sender, or null when delivery is not configured.
 */
export function createCodeSender(options: CodeSenderOptions): CodeSender | null {
  // PL: Poza trybem deweloperskim nie wypisujemy kodu nigdzie: kod w logach serwera to wyciek.
  // EN: Outside dev mode we print the code nowhere: a code in server logs is a leak.
  if (!options.isDev) return null;

  // PL: Domyślne miejsce wypisania to terminal serwera deweloperskiego.
  // EN: The default place to print is the dev server terminal.
  const print = options.print ?? ((line: string) => console.info(line));

  // PL: Nadawca deweloperski: jedna linia z adresem i kodem.
  // EN: The dev sender: one line with the address and the code.
  return async ({ email, code }) => {
    print(`[auth/email] Kod logowania dla ${email}: ${code}`);
  };
}

/**
 * PL: Czy ten program działa w serwerze deweloperskim albo w testach. Vite podmienia import.meta.env.DEV na stałą przy budowaniu, więc w zbudowanym Workerze funkcja zawsze zwraca false i nadawca kodu nie powstaje (kod funkcji zostaje w paczce, ale nic go nie wywołuje).
 * EN: Whether this program runs in the dev server or in tests. Vite replaces import.meta.env.DEV with a constant at build time, so in the built Worker the function always returns false and the code sender is never created (the sender code stays in the bundle, but nothing calls it).
 *
 * @returns PL: prawda w dev i w testach, fałsz w zbudowanym Workerze. EN: true in dev and tests, false in the built Worker.
 */
export function isDevRuntime(): boolean {
  // PL: Literalny zapis jest konieczny, bo Vite podmienia tylko dokładnie ten wyraz.
  // EN: The literal form is required, because Vite replaces only exactly this expression.
  return import.meta.env.DEV;
}
