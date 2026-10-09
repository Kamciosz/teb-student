/**
 * PL: Lista funkcji, które kasują dane ucznia przy usunięciu konta: po jednej na moduł z danymi ucznia. Powstała w etapie A i nikt jej potem nie zmienia, bo moduł dopisuje kasowanie we własnej funkcji. Profil (podtor 7) wywołuje wszystkie wpisy z listy.
 * EN: The list of functions that delete a student's data when the account is deleted: one per module that holds student data. It was made in stage A and nobody changes it afterwards, because a module adds its deletion inside its own function. Profile (subtrack 7) calls every entry of the list.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses worker/auth/index.ts::deleteAuthStudentData
 * @uses worker/media/index.ts::deleteMediaStudentData
 * @uses worker/news/index.ts::deleteNewsStudentData
 * @uses worker/reports/index.ts::deleteReportsStudentData
 * @uses worker/surveys/index.ts::deleteSurveysStudentData
 * @uses worker/profile/index.ts::deleteProfileStudentData
 * @uses worker/admin/index.ts::deleteAdminStudentData
 * @used_by worker/shared/accountDeletion.test.ts::STUDENT_DATA_DELETERS
 */

// PL: Typ funkcji kasującej, wspólny dla modułów.
// EN: The type of the deleting function, shared by the modules.
import type { DeleteStudentData } from './index';
// PL: Funkcje kasujące modułów. Każdy moduł importujemy tylko przez jego index.ts.
// EN: The deleting functions of the modules. We import every module only through its index.ts.
import { deleteAuthStudentData } from '../auth';
import { deleteMediaStudentData } from '../media';
import { deleteNewsStudentData } from '../news';
import { deleteReportsStudentData } from '../reports';
import { deleteSurveysStudentData } from '../surveys';
import { deleteProfileStudentData } from '../profile';
import { deleteAdminStudentData } from '../admin';

/**
 * PL: Jeden wpis listy: moduł i jego funkcja kasująca.
 * EN: One entry of the list: a module and its deleting function.
 */
export type StudentDataDeleter = {
  /** PL: Nazwa modułu, taka jak nazwa jego katalogu w worker/. EN: The module name, the same as its directory name in worker/. */
  module: string;
  /** PL: Funkcja, która kasuje dane ucznia z tego modułu. EN: The function that deletes the student's data from this module. */
  deleteStudentData: DeleteStudentData;
};

/**
 * PL: Moduły z danymi ucznia. Pulpit i licznik do dzwonka nie mają własnych danych ucznia, więc ich tu nie ma.
 * EN: The modules with student data. The dashboard and the bell countdown hold no student data of their own, so they are not here.
 */
export const STUDENT_DATA_DELETERS: readonly StudentDataDeleter[] = [
  // PL: Konto, sesje i kody logowania (podtory 1a i 1b).
  // EN: Account, sessions and sign-in codes (subtracks 1a and 1b).
  { module: 'auth', deleteStudentData: deleteAuthStudentData },
  // PL: Zdjęcia i filmy wysłane przez ucznia (podtor 2).
  // EN: Photos and videos uploaded by the student (subtrack 2).
  { module: 'media', deleteStudentData: deleteMediaStudentData },
  // PL: Wpisy aktualności (podtory 3a–3c).
  // EN: News entries (subtracks 3a–3c).
  { module: 'news', deleteStudentData: deleteNewsStudentData },
  // PL: Zgłoszenia (podtory 4a i 4b).
  // EN: Reports (subtracks 4a and 4b).
  { module: 'reports', deleteStudentData: deleteReportsStudentData },
  // PL: Ślad wypełnienia ankiety (podtory 5a i 5b).
  // EN: The trace of filling in a survey (subtracks 5a and 5b).
  { module: 'surveys', deleteStudentData: deleteSurveysStudentData },
  // PL: Dane profilu (podtor 7).
  // EN: Profile data (subtrack 7).
  { module: 'profile', deleteStudentData: deleteProfileStudentData },
  // PL: Role i kody zaproszeń w panelu (podtor 8).
  // EN: Roles and invitation codes in the panel (subtrack 8).
  { module: 'admin', deleteStudentData: deleteAdminStudentData },
];
