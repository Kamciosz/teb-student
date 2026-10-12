/**
 * PL: Testy adresów w treści wpisu: identyfikator filmu z różnych form adresu YouTube, odrzucanie obcych domen i protokołów oraz rozpoznawanie serwisów społecznościowych. Oblewają, gdy ktoś poluzuje sprawdzanie https albo domen.
 * EN: Tests of the addresses in the entry content: the video id from different YouTube address forms, rejecting foreign domains and protocols, and recognising social networks. They fail when someone loosens the https or domain check.
 *
 * @author Szymon
 * @since 2026-10-12
 * @uses src/features/news/editor/document/urls.ts::parseYouTubeId
 * @used_by vitest.config.ts::include
 */

// PL: Funkcje testowe Vitest.
// EN: Vitest test functions.
import { describe, expect, it } from 'vitest';
import { normalizeHttpsUrl, parseYouTubeId, socialNetworkName } from './urls';

// PL: Formy adresu filmu, z których dostajemy ten sam identyfikator.
// EN: The video address forms that give the same id.
describe('parseYouTubeId', () => {
  const id = 'dQw4w9WgXcQ';
  it.each([
    `https://www.youtube.com/watch?v=${id}&t=10`,
    `https://youtu.be/${id}?si=abc`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`,
    `  https://youtu.be/${id}  `,
  ])('wyciąga identyfikator z %s / extracts the id from %s', (url) => {
    expect(parseYouTubeId(url)).toBe(id);
  });

  it.each([
    `http://youtu.be/${id}`,
    `https://evil.example/watch?v=${id}`,
    `https://youtube.com.evil.example/watch?v=${id}`,
    'https://www.youtube.com/watch?v=krotki',
    'javascript:alert(1)',
    42,
  ])('odrzuca %s / rejects %s', (value) => {
    expect(parseYouTubeId(value)).toBeNull();
  });
});

// PL: Adres https bez loginu i hasła.
// EN: An https address without a user name and password.
describe('normalizeHttpsUrl', () => {
  it('odrzuca adres z loginem i inne protokoły / rejects an address with a login and other protocols', () => {
    expect(normalizeHttpsUrl('https://user:pass@example.org')).toBeNull();
    expect(normalizeHttpsUrl('JaVaScRiPt:alert(1)')).toBeNull();
    expect(normalizeHttpsUrl('https://example.org/a')).toBe('https://example.org/a');
  });
});

// PL: Serwisy z kartą linku.
// EN: The networks with a link card.
describe('socialNetworkName', () => {
  it('rozpoznaje serwis i jego subdomenę, ale nie podobną domenę / recognises a network and its subdomain, but not a lookalike domain', () => {
    expect(socialNetworkName('https://www.tiktok.com/@teb')).toBe('TikTok');
    expect(socialNetworkName('https://twitter.com/teb')).toBe('X');
    expect(socialNetworkName('https://fakex.com/teb')).toBeNull();
    expect(socialNetworkName('http://instagram.com/teb')).toBeNull();
  });
});
