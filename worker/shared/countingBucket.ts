/**
 * PL: Zasobnik R2 do testów z licznikiem zapisów. Opakowuje prawdziwy zasobnik testowy: liczy wywołania put i resztę operacji przekazuje dalej bez zmian. Pozwala sprawdzić, że plik za duży w ogóle nie trafił do R2.
 * EN: An R2 bucket for tests with a write counter. It wraps the real test bucket: it counts put calls and passes the other operations on unchanged. It lets a test check that an oversized file never reached R2.
 *
 * @author Szymon
 * @since 2026-10-31
 * @uses worker/shared/index.ts::MEDIA
 * @used_by worker/media/routes.test.ts::mediaApp
 * @used_by worker/media/upload.test.ts::storeMedia
 */

// PL: Środowisko testowe Workera z prawdziwym zasobnikiem R2 (MEDIA).
// EN: The Worker test environment with the real R2 bucket (MEDIA).
import { env } from 'cloudflare:workers';

/**
 * PL: Zwraca zasobnik z licznikiem oraz funkcję, która podaje, ile razy zapisano.
 * EN: Returns the bucket with a counter and a function that gives how many times something was written.
 *
 * @returns PL: zasobnik i licznik zapisów. EN: the bucket and the write counter.
 */
export function countingBucket(): { bucket: R2Bucket; writes: () => number } {
  let writes = 0;
  const bucket = new Proxy(env.MEDIA, {
    get(target, property) {
      // PL: Każdy zapis zwiększa licznik, a sam zapis idzie do prawdziwego zasobnika.
      // EN: Every write increases the counter, and the write itself goes to the real bucket.
      if (property === 'put') {
        return (...args: Parameters<R2Bucket['put']>) => {
          writes += 1;
          return target.put(...args);
        };
      }
      // PL: Pozostałe metody wywołujemy na prawdziwym zasobniku.
      // EN: The other methods are called on the real bucket.
      const value = Reflect.get(target, property);
      return typeof value === 'function' ? value.bind(target) : value;
    },
  });
  return { bucket, writes: () => writes };
}
