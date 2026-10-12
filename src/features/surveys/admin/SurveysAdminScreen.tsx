/**
 * PL: Ekrany ankiet w panelu (podtor 5b): lista, nowa ankieta i wyniki. Router dopasowuje ten komponent do /surveys/admin/*, a tu rozdzielamy dalszy adres: sama lista, /new z formularzem i /<numer ankiety> z wynikami.
 * EN: The survey screens in the panel (subtrack 5b): the list, a new survey and the results. The router matches this component to /surveys/admin/*, and here we split the rest of the address: the list alone, /new with the form and /<survey id> with the results.
 *
 * @author Jakub
 * @since 2026-10-12
 * @uses src/features/surveys/admin/SurveyListScreen.tsx::SurveyListScreen
 * @uses src/features/surveys/admin/NewSurveyScreen.tsx::NewSurveyScreen
 * @uses src/features/surveys/admin/ResultsScreen.tsx::ResultsScreen
 * @used_by src/features/surveys/admin/index.ts::SurveysAdminScreen
 */

import { Route, Routes } from 'react-router';
// PL: Style ekranów ankiet w panelu. Kolory tylko ze zmiennych w tokens.css.
// EN: The survey panel screen styles. Colors only from the variables in tokens.css.
import './admin.css';
import { NewSurveyScreen } from './NewSurveyScreen';
import { ResultsScreen } from './ResultsScreen';
import { SurveyListScreen } from './SurveyListScreen';

/**
 * PL: Rysuje właściwy ekran podtoru 5b dla bieżącego adresu. Sam nie pobiera danych.
 * EN: Draws the right subtrack 5b screen for the current address. It fetches no data itself.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveysAdminScreen() {
  // PL: „new” jest stałym adresem, więc wygrywa z numerem ankiety.
  // EN: "new" is a fixed address, so it wins over a survey id.
  return (
    <Routes>
      <Route index element={<SurveyListScreen />} />
      <Route path="new" element={<NewSurveyScreen />} />
      <Route path=":surveyId" element={<ResultsScreen />} />
    </Routes>
  );
}
