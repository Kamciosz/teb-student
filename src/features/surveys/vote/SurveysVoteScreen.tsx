/**
 * PL: Ekrany ankiet dla ucznia (podtor 5a): lista, pytania i potwierdzenie. Router dopasowuje ten komponent do /surveys/vote/*, a tu rozdzielamy dalszy adres: sama lista, /<numer ankiety> z pytaniami i /done z potwierdzeniem.
 * EN: The survey screens for the student (subtrack 5a): the list, the questions and the confirmation. The router matches this component to /surveys/vote/*, and here we split the rest of the address: the list alone, /<survey id> with the questions and /done with the confirmation.
 *
 * @author Jakub
 * @since 2026-10-09
 * @uses src/features/surveys/vote/SurveyListScreen.tsx::SurveyListScreen
 * @uses src/features/surveys/vote/SurveyFlowScreen.tsx::SurveyFlowScreen
 * @uses src/features/surveys/vote/SurveyDoneScreen.tsx::SurveyDoneScreen
 * @used_by src/features/surveys/vote/index.ts::SurveysVoteScreen
 */

// PL: Zagnieżdżone trasy: dalsza część adresu po /surveys/vote.
// EN: Nested routes: the rest of the address after /surveys/vote.
import { Route, Routes } from 'react-router';
// PL: Style ekranów ankiety. Kolory tylko ze zmiennych w tokens.css.
// EN: The survey screen styles. Colors only from the variables in tokens.css.
import './vote.css';
import { SurveyDoneScreen } from './SurveyDoneScreen';
import { SurveyFlowScreen } from './SurveyFlowScreen';
import { SurveyListScreen } from './SurveyListScreen';

/**
 * PL: Rysuje właściwy ekran podtoru 5a dla bieżącego adresu. Sam nie pobiera danych.
 * EN: Draws the right subtrack 5a screen for the current address. It fetches no data itself.
 *
 * @returns PL: drzewo elementów ekranu. EN: the tree of screen elements.
 */
export function SurveysVoteScreen() {
  // PL: „done” jest stałym adresem, więc wygrywa z numerem ankiety.
  // EN: "done" is a fixed address, so it wins over a survey id.
  return (
    <Routes>
      <Route index element={<SurveyListScreen />} />
      <Route path="done" element={<SurveyDoneScreen />} />
      <Route path=":surveyId" element={<SurveyFlowScreen />} />
    </Routes>
  );
}
