/**
 * PL: Testy generatora kodu i SQL pierwszego administratora: kształt kodu, brak stałych wartości, odrzucanie złego loginu, zużycie kodu z wygenerowanego SQL dokładnie raz i nadanie roli admin koncie założonemu tym kodem. Działają na prawdziwej bazie D1 testów, na tych samych tabelach co reszta testów.
 * EN: Tests of the code generator and of the first administrator's SQL: the code shape, no fixed values, rejecting a bad login, using a code from the generated SQL exactly once and granting the admin role to the account created with that code. They run on the real test D1 database, on the same tables as the other tests.
 *
 * @author Szymon
 * @since 2026-10-31
 * @uses worker/auth/invite/generateInviteCode.ts::generateInviteCode
 * @uses worker/auth/invite/firstAdminSql.ts::buildFirstAdminSql
 * @uses worker/auth/invite/inviteCodes.ts::consumeInviteCode
 * @used_by vitest.config.ts::include
 */

// PL: Baza testowa i funkcje testowe.
// EN: The test database and the test functions.
import { env } from 'cloudflare:workers';
import { describe, expect, it } from 'vitest';
import { buildFirstAdminSql } from './firstAdminSql';
import { generateInviteCode } from './generateInviteCode';
import { consumeInviteCode } from './inviteCodes';
import { INVITE_CODE_PATTERN } from './settings';

// PL: Grupa testów generatora kodu.
// EN: A group of code generator tests.
describe('generator kodu / code generator', () => {
  // PL: Kod ma kształt TEB-XXXX-XX z dozwolonym alfabetem.
  // EN: The code has the TEB-XXXX-XX shape with the allowed alphabet.
  it('ma kształt TEB-XXXX-XX / has the TEB-XXXX-XX shape', () => {
    expect(generateInviteCode()).toMatch(INVITE_CODE_PATTERN);
  });

  // PL: Kody nie są stałe: sto losowań daje same różne wartości.
  // EN: The codes are not fixed: a hundred draws give all different values.
  it('nie ma stałych wartości / has no fixed values', () => {
    const codes = new Set(Array.from({ length: 100 }, () => generateInviteCode()));
    expect(codes.size).toBe(100);
  });
});

// PL: Grupa testów SQL pierwszego administratora.
// EN: A group of the first administrator's SQL tests.
describe('SQL pierwszego administratora / first administrator SQL', () => {
  // PL: Login z wielkimi literami trafia do adresu małymi literami, a kod ma właściwy kształt.
  // EN: A login in capitals goes into the address in lowercase, and the code has the right shape.
  it('składa kod i adres konta z loginu / builds the code and the account address from the login', () => {
    const { code, grantSql } = buildFirstAdminSql('Ola3ta');
    expect(code).toMatch(INVITE_CODE_PATTERN);
    expect(grantSql).toContain("email = 'ola3ta@login.invalid'");
  });

  // PL: Login z cudzysłowem nie przechodzi, więc nic niebezpiecznego nie trafi do SQL.
  // EN: A login with a quote does not pass, so nothing unsafe gets into the SQL.
  it('odrzuca login spoza reguł / rejects a login outside the rules', () => {
    expect(() => buildFirstAdminSql("ola'; DROP TABLE user; --")).toThrow();
  });

  // PL: Każde złożenie daje inny kod i inny identyfikator wiersza.
  // EN: Every build gives a different code and a different row id.
  it('nie ma stałych wartości między wywołaniami / has no fixed values between calls', () => {
    const first = buildFirstAdminSql('pierwszy1');
    const second = buildFirstAdminSql('pierwszy1');
    expect(first.code).not.toBe(second.code);
    expect(first.inviteSql).not.toBe(second.inviteSql);
  });

  // PL: Kod z wygenerowanego SQL działa dokładnie raz, tak jak kod z panelu.
  // EN: The code from the generated SQL works exactly once, the same as a code from the panel.
  it('zużywa się dokładnie raz / is used exactly once', async () => {
    const { code, inviteSql } = buildFirstAdminSql('jednorazowy1');
    await env.DB.prepare(inviteSql).run();
    expect(await consumeInviteCode(env.DB, code)).not.toBeNull();
    expect(await consumeInviteCode(env.DB, code)).toBeNull();
  });

  // PL: Po rejestracji konta (wiersz w user) polecenie nadaje rolę admin temu kontu i tylko jemu.
  // EN: After the account is registered (a row in user) the command grants the admin role to this account only.
  it('nadaje rolę admin koncie po rejestracji / grants the admin role to the account after registration', async () => {
    const login = 'adminpierwszy';
    const { grantSql } = buildFirstAdminSql(login);
    const userId = `user-${login}`;
    await env.DB.prepare("INSERT INTO user (id, name, email) VALUES (?, '', ?)").bind(userId, `${login}@login.invalid`).run();
    await env.DB.prepare(grantSql).run();
    const { results } = await env.DB.prepare('SELECT role FROM panel_roles WHERE user_id = ?').bind(userId).all<{ role: string }>();
    expect(results.map((row) => row.role)).toEqual(['admin']);
  });
});
