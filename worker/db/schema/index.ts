/**
 * PL: Plik zbierający tabele wszystkich modułów. Powstał w etapie A i nikt go potem nie zmienia: nowe tabele wchodzą przez pliki modułów, bo każdy moduł ma tu swój wiersz.
 * EN: The file that collects the tables of all modules. It was made in stage A and nobody changes it afterwards: new tables arrive through the module files, because every module has its row here.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/db/schema/auth.ts::*
 * @uses worker/db/schema/media.ts::*
 * @uses worker/db/schema/news.ts::*
 * @uses worker/db/schema/reports.ts::*
 * @uses worker/db/schema/surveys.ts::*
 * @uses worker/db/schema/bell.ts::*
 * @uses worker/db/schema/profile.ts::*
 * @uses worker/db/schema/admin.ts::*
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
