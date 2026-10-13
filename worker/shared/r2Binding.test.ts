/**
 * PL: Test zasobnika R2 w testach Vitest: zapisuje mały plik pod binding MEDIA, czyta go z powrotem i sprawdza rozmiar. Gdyby binding MEDIA zniknął z wrangler.jsonc, test padnie, a inne podtory też nie zadziałają.
 * EN: Test of the R2 bucket in Vitest tests: writes a small file under the MEDIA binding, reads it back and checks the size. If the MEDIA binding went missing from wrangler.jsonc, the test would fail, and so would the other subtracks.
 *
 * @author Szymon Sosnowski
 * @since 2026-10-13
 * @uses wrangler.jsonc::r2_buckets
 * @uses worker/shared/index.ts::Env
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
// PL: Środowisko testowe z zasobnikiem R2 (binding MEDIA).
// EN: The test environment with the R2 bucket (the MEDIA binding).
import { env } from 'cloudflare:workers';

// PL: Grupa testów zasobnika R2.
// EN: A group of tests for the R2 bucket.
describe('zasobnik R2 w testach / R2 bucket in tests', () => {
  // PL: Zapis i odczyt pliku daje ten sam rozmiar, czyli binding działa.
  // EN: Writing and reading a file gives the same size, so the binding works.
  it('zapisuje i czyta plik / writes and reads a file', async () => {
    // PL: Klucz testowego pliku w zasobniku.
    // EN: The key of the test file in the bucket.
    const key = 'test/binding.txt';
    await env.MEDIA.put(key, 'abc');

    // PL: Odczytaj plik z powrotem i sprawdź jego treść.
    // EN: Read the file back and check its content.
    const object = await env.MEDIA.get(key);
    expect(object).not.toBeNull();
    expect(await object?.text()).toBe('abc');
  });
});
