/**
 * PL: Router Hono podtoru 4a (zgłoszenie ucznia). Dwa adresy pod /api/reports/student: POST zapisuje nowe zgłoszenie, GET oddaje zgłoszenia ucznia („Moje zgłoszenia”). Router jest podpięty w worker/mounts.ts.
 * EN: The Hono router of subtrack 4a (student report). Two routes under /api/reports/student: POST saves a new report, GET returns the student's reports ("Moje zgłoszenia"). The router is mounted in worker/mounts.ts.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses worker/reports/student/validation.ts::parseReportInput
 * @uses worker/reports/student/reportsRepository.ts::createReport
 * @uses worker/reports/student/reportsRepository.ts::listReportsByAuthor
 * @uses worker/reports/student/currentStudent.ts::getCurrentStudentId
 * @used_by worker/reports/student/index.ts::reportsStudentApp
 * @used_by worker/reports/student/routes.test.ts::reportsStudentApp
 */

// PL: Hono to router serwera. bodyLimit odrzuca zbyt duże zapytania, zanim je odczytamy.
// EN: Hono is the server router. bodyLimit rejects oversized requests before we read them.
import { Hono } from 'hono';
import { bodyLimit } from 'hono/body-limit';
// PL: Typ środowiska Workera (binding DB).
// EN: The Worker environment type (the DB binding).
import type { Env } from '../../shared';
// PL: Numer ucznia (na razie tymczasowy).
// EN: The student id (temporary for now).
import { getCurrentStudentId } from './currentStudent';
// PL: Zapis i odczyt zgłoszeń.
// EN: Saving and reading reports.
import { createReport, listReportsByAuthor } from './reportsRepository';
// PL: Sprawdzanie danych z telefonu.
// EN: Checking the data from the phone.
import { parseReportInput } from './validation';

/**
 * PL: Najwięcej bajtów, jakie przyjmuje zapytanie o nowe zgłoszenie. Opis ma najwyżej 500 znaków, więc 8 KB to duży zapas.
 * EN: The most bytes a new-report request may have. The description has at most 500 characters, so 8 KB is a large margin.
 */
const MAX_BODY_BYTES = 8 * 1024;

/**
 * PL: Router podtoru 4a. Bazę D1 bierze z `context.env.DB`, bo Env (worker/shared) ma binding DB.
 * EN: The router of subtrack 4a. It takes the D1 database from `context.env.DB`, because Env (worker/shared) has the DB binding.
 */
export const reportsStudentApp = new Hono<{ Bindings: Env }>();

// PL: POST / zapisuje nowe zgłoszenie. Zwraca 201 z numerem albo 400 przy złych danych.
// EN: POST / saves a new report. Returns 201 with the id or 400 for bad data.
reportsStudentApp.post('/', bodyLimit({ maxSize: MAX_BODY_BYTES, onError: (context) => context.json({ error: 'payload_too_large' }, 413) }), async (context) => {
  // PL: Odczytaj JSON. Zepsuty JSON to błąd telefonu (400), a nie serwera.
  // EN: Read the JSON. Broken JSON is the phone's error (400), not the server's.
  const body: unknown = await context.req.json().catch(() => undefined);

  // PL: Sprawdź dane. Telefon dostaje nazwy złych pól, żeby pokazać błąd przy właściwym polu.
  // EN: Validate the data. The phone gets the names of the bad fields, to show the error at the right field.
  const parsed = parseReportInput(body);
  if (!parsed.ok) return context.json({ error: 'invalid_report', fields: parsed.fields }, 400);

  // PL: Zapisz zgłoszenie dla ucznia z serwera, a nie z treści zapytania.
  // EN: Save the report for the student known to the server, not the one from the request body.
  const id = await createReport(context.env.DB, getCurrentStudentId(), parsed.value);
  return context.json({ id }, 201);
});

// PL: GET / oddaje zgłoszenia ucznia od najnowszego.
// EN: GET / returns the student's reports, newest first.
reportsStudentApp.get('/', async (context) => {
  // PL: Odczytaj tylko zgłoszenia tego ucznia.
  // EN: Read only this student's reports.
  const items = await listReportsByAuthor(context.env.DB, getCurrentStudentId());
  return context.json({ reports: items });
});
