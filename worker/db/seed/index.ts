/**
 * PL: Plik zbierający dane testowe wszystkich modułów. Powstał w etapie A i nikt go potem nie zmienia: nowe dane testowe wchodzą przez pliki modułów, bo każdy moduł ma tu swój wiersz.
 * EN: The file that collects the test data of all modules. It was made in stage A and nobody changes it afterwards: new test data arrive through the module files, because every module has its row here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/db/seed/auth.ts::*
 * @uses worker/db/seed/media.ts::*
 * @uses worker/db/seed/news.ts::*
 * @uses worker/db/seed/reports.ts::*
 * @uses worker/db/seed/surveys.ts::*
 * @uses worker/db/seed/bell.ts::*
 * @uses worker/db/seed/profile.ts::*
 * @uses worker/db/seed/admin.ts::*
 */

// PL: Moduł auth.
// EN: The auth module.
export * from './auth';

// PL: Moduł media.
// EN: The media module.
export * from './media';

// PL: Moduł news.
// EN: The news module.
export * from './news';

// PL: Moduł reports.
// EN: The reports module.
export * from './reports';

// PL: Moduł surveys.
// EN: The surveys module.
export * from './surveys';

// PL: Moduł bell.
// EN: The bell module.
export * from './bell';

// PL: Moduł profile.
// EN: The profile module.
export * from './profile';

// PL: Moduł admin.
// EN: The admin module.
export * from './admin';
