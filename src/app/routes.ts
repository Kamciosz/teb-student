/**
 * PL: Lista ekranów aplikacji w telefonie: adres każdego podtoru z docs/PODZIAL_PRACY.md (część 3) i jego ekran. Powstała w etapie A i nikt jej potem nie zmienia: nowe ekrany podtoru dodaje sam podtor w swoim katalogu, pod adresem, który tu już jest. Podtor 0 (wspólne) nie ma adresu.
 * EN: The list of app screens on the phone: the address of every subtrack from docs/PODZIAL_PRACY.md (part 3) and its screen. It was made in stage A and nobody changes it afterwards: a subtrack adds its further screens itself, in its own directory, under the address that is already here. Subtrack 0 (shared) has no address.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/features/auth/index.ts::AuthEmailScreen
 * @uses src/features/media/index.ts::MediaScreen
 * @uses src/features/news/index.ts::NewsFeedScreen
 * @uses src/features/reports/index.ts::ReportsStudentScreen
 * @uses src/features/surveys/index.ts::SurveysVoteScreen
 * @uses src/features/bell/index.ts::BellScreen
 * @uses src/features/profile/index.ts::ProfileScreen
 * @uses src/features/admin/index.ts::AdminLayout
 * @uses src/features/dashboard/index.ts::DashboardScreen
 * @used_by src/App.tsx::router
 * @used_by src/app/routes.test.ts::APP_ROUTES
 */

// PL: Typ opisu jednego adresu w React Router.
// EN: The type describing one address in React Router.
import type { RouteObject } from 'react-router';
// PL: Ekrany modułów. Każdy moduł importujemy tylko przez jego index.ts.
// EN: The module screens. We import every module only through its index.ts.
import { AuthEmailScreen, AuthInviteScreen } from '../features/auth';
import { MediaScreen } from '../features/media';
import { NewsAdminScreen, NewsEditorScreen, NewsFeedScreen } from '../features/news';
import { ReportsAdminScreen, ReportsStudentScreen } from '../features/reports';
import { SurveysAdminScreen, SurveysVoteScreen } from '../features/surveys';
import { BellScreen } from '../features/bell';
import { ProfileScreen } from '../features/profile';
import { AdminLayout, AdminScreen } from '../features/admin';
import { DashboardScreen } from '../features/dashboard';

/**
 * PL: Adresy ekranów. Adres to „/<moduł>/<część>” (docs/adr/0002-adresy-podtorow.md), a „/*” na końcu oddaje podtorowi wszystkie adresy pod spodem. Pulpit (podtor 9) jest pod „/”. Pole id to numer podtoru. Ekrany 3c, 4b, 5b i 8 mają wspólną ramę panelu z menu.
 * EN: The screen addresses. The address is "/<module>/<part>" (docs/adr/0002-adresy-podtorow.md), and the trailing "/*" gives the subtrack every address below it. The dashboard (subtrack 9) is at "/". The id field is the subtrack number. Screens 3c, 4b, 5b and 8 share the panel frame with the menu.
 */
export const APP_ROUTES: RouteObject[] = [
  // PL: Pulpit, ekran startowy.
  // EN: The dashboard, the start screen.
  { id: '9', path: '/', Component: DashboardScreen },
  // PL: Logowanie kodem z maila i kodem zaproszenia.
  // EN: Sign-in with an e-mail code and with an invitation code.
  { id: '1a', path: '/auth/email/*', Component: AuthEmailScreen },
  { id: '1b', path: '/auth/invite/*', Component: AuthInviteScreen },
  // PL: Wysyłka zdjęć i filmów.
  // EN: Photo and video upload.
  { id: '2', path: '/media/*', Component: MediaScreen },
  // PL: Aktualności dla ucznia i edytor wpisów (edytor to osobny ekran bez ramy panelu).
  // EN: News for the student and the entry editor (the editor is a separate screen without the panel frame).
  { id: '3a', path: '/news/feed/*', Component: NewsFeedScreen },
  { id: '3b', path: '/news/editor/*', Component: NewsEditorScreen },
  // PL: Zgłoszenia i ankiety dla ucznia.
  // EN: Reports and surveys for the student.
  { id: '4a', path: '/reports/student/*', Component: ReportsStudentScreen },
  { id: '5a', path: '/surveys/vote/*', Component: SurveysVoteScreen },
  // PL: Licznik do dzwonka, profil i ustawienia.
  // EN: The bell countdown, profile and settings.
  { id: '6', path: '/bell/*', Component: BellScreen },
  { id: '7', path: '/profile/*', Component: ProfileScreen },
  // PL: Panel Samorządu: rama z menu i cztery części (wpisy, zgłoszenia, ankiety, rama z kodami i rolami).
  // EN: The Student Council panel: the frame with the menu and four sections (entries, reports, surveys, the frame with codes and roles).
  {
    id: 'panel',
    Component: AdminLayout,
    children: [
      { id: '3c', path: '/news/admin/*', Component: NewsAdminScreen },
      { id: '4b', path: '/reports/admin/*', Component: ReportsAdminScreen },
      { id: '5b', path: '/surveys/admin/*', Component: SurveysAdminScreen },
      { id: '8', path: '/admin/*', Component: AdminScreen },
    ],
  },
];
