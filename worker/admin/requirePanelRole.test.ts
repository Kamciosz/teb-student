/**
 * PL: Testy middleware requirePanelRole: 401 bez sesji, 403 bez roli i przy roli za niskiej, przepuszczenie przy roli wystarczającej, rola w kontekście. Sesję udaje wymyślone sprawdzanie sesji (nagłówek x-student), a role idą z prawdziwej bazy D1.
 * EN: Tests of the requirePanelRole middleware: 401 without a session, 403 without a role and with a too low role, letting through with a sufficient role, the role in the context. The session is faked by an invented session check (the x-student header), and the roles come from a real D1 database.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses worker/admin/requirePanelRole.ts::createRequirePanelRole
 * @uses worker/db/seed/admin.ts::ADMIN_SEED
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { beforeEach, describe, expect, it } from 'vitest';
// PL: Środowisko testowe Workera z bazą D1.
// EN: The Worker test environment with the D1 database.
import { env } from 'cloudflare:workers';
// PL: Klient bazy do wpisania ról.
// EN: The database client to insert the roles.
import { drizzle } from 'drizzle-orm/d1';
// PL: Hono do zbudowania wymyślonego routera innego podtoru.
// EN: Hono to build an invented router of another subtrack.
import { Hono, type MiddlewareHandler } from 'hono';
// PL: Typ środowiska ucznia z drzwi modułu auth.
// EN: The student environment type from the auth module door.
import type { StudentEnv } from '../auth';
// PL: Tabela ról i dane testowe.
// EN: The roles table and the test data.
import { panelRoles } from '../db/schema/admin';
import { ADMIN_SEED, ADMIN_SEED_ADMIN_ID, ADMIN_SEED_EDITOR_ID } from '../db/seed/admin';
// PL: Fabryka, którą sprawdzamy, i typ środowiska z rolą.
// EN: The factory under test and the environment type with the role.
import { createRequirePanelRole, type PanelEnv } from './requirePanelRole';

/**
 * PL: Wymyślone sprawdzanie sesji: uczniem jest ten, kogo wskazuje nagłówek x-student, a bez nagłówka odpowiada 401, tak jak prawdziwe requireStudent.
 * EN: An invented session check: the student is the one the x-student header names, and without the header it answers 401, like the real requireStudent.
 */
const fakeSession: MiddlewareHandler<StudentEnv> = async (context, next) => {
  // PL: Weź numer ucznia z nagłówka.
  // EN: Take the student id from the header.
  const id = context.req.header('x-student');
  // PL: Bez nagłówka nie ma sesji.
  // EN: Without the header there is no session.
  if (!id) return context.json({ error: 'unauthorized' }, 401);
  context.set('student', { id, email: `${id}@teb.edu.pl` });
  await next();
};

/**
 * PL: Buduje wymyślony router innego podtoru, który wymaga roli co najmniej Samorządu, i oddaje rolę z kontekstu.
 * EN: Builds an invented router of another subtrack that requires at least the Council role, and returns the role from the context.
 *
 * @param minimum - PL: rola minimalna. EN: the minimum role.
 * @returns PL: router z jednym adresem /tajne. EN: a router with one route, /secret.
 */
function createApp(minimum: 'editor' | 'council' | 'admin') {
  const app = new Hono<PanelEnv>();
  app.use(createRequirePanelRole(fakeSession)(minimum));
  app.get('/secret', (context) => context.json({ student: context.get('student').id, level: context.get('panelLevel') }));
  return app;
}

/**
 * PL: Pyta router o /tajne jako wskazany uczeń albo bez sesji.
 * EN: Asks the router for /secret as the given student or without a session.
 *
 * @param app - PL: router. EN: the router.
 * @param student - PL: numer ucznia albo null (bez sesji). EN: the student id or null (no session).
 * @returns PL: odpowiedź. EN: the response.
 */
function ask(app: ReturnType<typeof createApp>, student: string | null): Response | Promise<Response> {
  return app.request('/secret', { headers: student === null ? {} : { 'x-student': student } }, env);
}

// PL: Przed każdym testem wpisz od nowa role testowe: administrator i redakcja.
// EN: Before every test insert the test roles anew: an administrator and the editorial team.
beforeEach(async () => {
  await drizzle(env.DB).delete(panelRoles);
  await drizzle(env.DB).insert(panelRoles).values(ADMIN_SEED);
});

// PL: Grupa testów sprawdzania roli.
// EN: A group of tests for the role check.
describe('requirePanelRole', () => {
  it('bez sesji odpowiada 401 / answers 401 without a session', async () => {
    expect((await ask(createApp('editor'), null)).status).toBe(401);
  });

  it('uczeń bez roli dostaje 403, nawet tam, gdzie wystarcza redakcja / a student without a role gets 403, even where the editorial role is enough', async () => {
    expect((await ask(createApp('editor'), 'nie-ma-roli')).status).toBe(403);
  });

  it('redakcja przechodzi do Wpisów, ale nie dalej / the editorial team passes to Entries, but no further', async () => {
    expect((await ask(createApp('editor'), ADMIN_SEED_EDITOR_ID)).status).toBe(200);
    expect((await ask(createApp('council'), ADMIN_SEED_EDITOR_ID)).status).toBe(403);
  });

  it('administrator przechodzi wszędzie i router widzi jego rolę / the administrator passes everywhere and the router sees their role', async () => {
    const response = await ask(createApp('council'), ADMIN_SEED_ADMIN_ID);
    expect(response.status).toBe(200);
    expect(await response.json()).toEqual({ student: ADMIN_SEED_ADMIN_ID, level: 'admin' });
  });

  it('Samorząd nie wchodzi tam, gdzie trzeba administratora / the Council does not enter where the administrator is needed', async () => {
    // PL: Daj uczniowi bez roli rolę Samorządu.
    // EN: Give a student without a role the Council role.
    await drizzle(env.DB).insert(panelRoles).values({ userId: 'samorzad', role: 'council', grantedAt: 1 });
    expect((await ask(createApp('council'), 'samorzad')).status).toBe(200);
    expect((await ask(createApp('admin'), 'samorzad')).status).toBe(403);
  });
});
