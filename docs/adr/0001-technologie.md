# ADR 0001: technologie aplikacji

- **Data:** 9.10.2026
- **Status:** przyjęta
- **Autor:** Bohdan (decyzja), Szymon (zapis)

## Kontekst

Aplikację budujemy od zera w trzy tygodnie, z pomocą agentów AI. Budżet to 50 zł. Aplikacja ma działać szybko na słabym telefonie, także na iPhonie z iOS 15 i starszym Androidzie, oraz bez internetu.

## Rozważane opcje

Pełna lista technologii i odrzuconych zamienników jest w `docs/TECHNOLOGIE.md`, w sekcjach „Co zmieniło się po przeglądzie” i „Co zostaje i dlaczego”.

## Decyzja

React 19 z React Compiler, Vite 8 z @vitejs/plugin-legacy, TypeScript, zwykły CSS ze zmiennymi, React Router tylko w przeglądarce, TanStack Query z zapisem w telefonie, vite-plugin-pwa. Serwer to jeden Cloudflare Worker z Hono, baza D1 z Drizzle, pliki w R2, zdjęcia wyświetlane przez Cloudflare Images. Logowanie przez Better Auth. Testy: Vitest, @cloudflare/vitest-plugin, Playwright. Node.js 22.22 lub nowszy.

## Konsekwencje

- Wszystko działa na Cloudflare w planie płatnym, około 37 zł za 2 miesiące.
- Agent nie zmienia technologii sam. Zmiana wymaga nowego ADR i zgody Bohdana.
- Dokładne wersje przypina szkielet (etap A) w `package.json`.
- Gdy na punkcie kontrolnym 29.10 nie działa logowanie albo aktualności, przechodzimy na Supabase i Vercel.
