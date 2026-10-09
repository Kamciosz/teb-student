/**
 * PL: Test funkcji kasującej dane ucznia z modułu auth: konto, sesje i oczekujący kod znikają, a dane innego ucznia zostają.
 * EN: Test of the function that deletes the student's data from the auth module: the account, the sessions and the pending code go away, while another student's data stays.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/auth/email/deleteStudentData.ts::createDeleteAuthStudentData
 * @uses worker/auth/email/testRuntime.ts::createTestRuntime
 * @used_by vitest.config.ts::include
 */

import { describe, expect, it } from 'vitest';
import { createDeleteAuthStudentData } from './deleteStudentData';
import { call, createTestRuntime, signIn } from './testRuntime';

/** PL: Wymyślone adresy dwóch uczniów. EN: Invented addresses of two students. */
const JAN = 'jan.test@teb.edu.pl';
const ANNA = 'anna.test@teb.edu.pl';

// PL: Grupa testów kasowania danych ucznia z modułu auth.
// EN: A group of tests for deleting the student's data from the auth module.
describe('deleteAuthStudentData', () => {
  // PL: Po skasowaniu sesja ucznia znika, jego konto też, a drugi uczeń zostaje zalogowany.
  // EN: After the deletion the student's session is gone, so is the account, and the other student stays signed in.
  it('kasuje konto i sesje ucznia, cudze zostają / deletes the student account and sessions, others stay', async () => {
    const test = createTestRuntime();
    const janCookie = await signIn(test, JAN);
    const annaCookie = await signIn(test, ANNA);
    const { internalAdapter } = await test.runtime.auth.$context;
    const jan = await internalAdapter.findUserByEmail(JAN);
    expect(jan).not.toBeNull();

    await createDeleteAuthStudentData(() => test.runtime)({ userId: jan?.user.id ?? '' });

    expect(await internalAdapter.findUserByEmail(JAN)).toBeNull();
    expect(await (await call(test.app, '/get-session', { cookie: janCookie })).json()).toBeNull();
    const anna = (await (await call(test.app, '/get-session', { cookie: annaCookie })).json()) as { user: { email: string } };
    expect(anna.user.email).toBe(ANNA);
  });
});

// PL: Grupa testów kodu i nieznanego ucznia.
// EN: A group of tests for the code and an unknown student.
describe('deleteAuthStudentData: kod i nieznany uczeń / code and unknown student', () => {
  // PL: Oczekujący kod ucznia też znika: po skasowaniu nie da się nim zalogować i założyć konta od nowa.
  // EN: The student's pending code goes too: after the deletion it cannot be used to sign in and create the account again.
  it('kasuje oczekujący kod / deletes the pending code', async () => {
    const test = createTestRuntime();
    await signIn(test, JAN);
    await call(test.app, '/email-otp/send-verification-otp', { body: { email: JAN } });
    const pendingCode = test.sent[test.sent.length - 1]?.code;
    const { internalAdapter } = await test.runtime.auth.$context;
    const jan = await internalAdapter.findUserByEmail(JAN);

    await createDeleteAuthStudentData(() => test.runtime)({ userId: jan?.user.id ?? '' });

    const response = await call(test.app, '/sign-in/email-otp', { body: { email: JAN, otp: pendingCode } });
    expect(response.status).toBe(400);
    expect(await internalAdapter.findUserByEmail(JAN)).toBeNull();
  });

  // PL: Nieznany numer ucznia niczego nie zmienia i nie rzuca błędu.
  // EN: An unknown student id changes nothing and does not throw.
  it('nieznany uczeń nic nie zmienia / an unknown student changes nothing', async () => {
    const test = createTestRuntime();
    const cookie = await signIn(test, JAN);
    await createDeleteAuthStudentData(() => test.runtime)({ userId: 'nie-ma-takiego' });
    const session = (await (await call(test.app, '/get-session', { cookie })).json()) as { user: { email: string } };
    expect(session.user.email).toBe(JAN);
  });
});
