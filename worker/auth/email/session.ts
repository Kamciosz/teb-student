/**
 * PL: Sprawdzanie sesji ucznia po stronie serwera, dla innych podtorów. Middleware requireStudent odrzuca zapytanie bez sesji kodem 401, a z sesją udostępnia ucznia w c.get('student').
 * EN: Student session check on the server side, for other subtracks. The requireStudent middleware rejects a request without a session with code 401, and with a session exposes the student in c.get('student').
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/runtimeAuth.ts::getRuntimeAuth
 * @used_by worker/auth/email/index.ts::requireStudent
 * @used_by worker/auth/email/session.test.ts::createRequireStudent
 */

// PL: Typ middleware z Hono.
// EN: The middleware type from Hono.
import type { MiddlewareHandler } from 'hono';
import { AuthNotConfiguredError, getRuntimeAuth, type RuntimeAuth } from './runtimeAuth';

/**
 * PL: Zalogowany uczeń: tyle, ile moduły muszą o nim wiedzieć. Reszta (zdjęcie, rola) należy do profilu i panelu.
 * EN: A signed-in student: as much as the modules must know about them. The rest (photo, role) belongs to profile and the panel.
 */
export type Student = {
  /** PL: Numer ucznia (konta). EN: The student (account) id. */
  id: string;
  /** PL: Adres szkolny ucznia, małymi literami. EN: The student's school address, lowercase. */
  email: string;
};

/**
 * PL: Typ środowiska Hono z uczniem. Użyj go tak: new Hono<StudentEnv>().use(requireStudent).
 * EN: The Hono environment type with the student. Use it like this: new Hono<StudentEnv>().use(requireStudent).
 */
export type StudentEnv = { Variables: { student: Student } };

/**
 * PL: Buduje middleware sprawdzające sesję. Osobna funkcja, żeby test mógł podać obiekt na pamięci.
 * EN: Builds the session-checking middleware. A separate function so a test can pass an object on memory.
 *
 * @param getRuntime - PL: zwraca obiekt logowania. EN: returns the sign-in object.
 * @returns PL: middleware Hono. EN: the Hono middleware.
 */
export function createRequireStudent(getRuntime: () => RuntimeAuth): MiddlewareHandler<StudentEnv> {
  return async (context, next) => {
    // PL: Serwer bez ustawień logowania to 503, nie 401: uczeń nie zrobił nic złego.
    // EN: A server without sign-in settings is 503, not 401: the student did nothing wrong.
    let runtime: RuntimeAuth;
    try {
      runtime = getRuntime();
    } catch (error) {
      if (error instanceof AuthNotConfiguredError) return context.json({ error: 'not_configured' }, 503);
      throw error;
    }

    // PL: Sesja z ciasteczka zapytania. Brak ciasteczka, zły podpis i wygasła sesja dają null.
    // EN: The session from the request cookie. A missing cookie, a bad signature and an expired session give null.
    const session = await runtime.auth.api.getSession({ headers: context.req.raw.headers });
    if (!session) return context.json({ error: 'unauthorized' }, 401);

    // PL: Udostępnij ucznia dalszym funkcjom i przejdź dalej.
    // EN: Expose the student to the next functions and go on.
    context.set('student', { id: session.user.id, email: session.user.email });
    await next();
  };
}

/**
 * PL: Middleware dla routerów innych podtorów: wymaga zalogowanego ucznia.
 * EN: Middleware for other subtracks' routers: requires a signed-in student.
 */
export const requireStudent: MiddlewareHandler<StudentEnv> = createRequireStudent(getRuntimeAuth);
