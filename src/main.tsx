/**
 * PL: Punkt wejścia aplikacji w telefonie. Znajduje element #root w index.html i rysuje w nim ekran startowy.
 * EN: Entry point of the app on the phone. Finds the #root element in index.html and draws the start screen in it.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/App.tsx::App
 * @uses src/shared/styles/tokens.css::var(--...)
 * @uses src/shared/styles/base.css::var(--...)
 * @used_by index.html::script
 */

// PL: StrictMode wykrywa błędy w komponentach podczas pracy deweloperskiej.
// EN: StrictMode detects component bugs during development.
import { StrictMode } from 'react';
// PL: createRoot uruchamia React w wybranym elemencie strony.
// EN: createRoot starts React inside a chosen page element.
import { createRoot } from 'react-dom/client';
// PL: Zmienne wyglądu (kolory, typografia, odstępy). Muszą być wczytane przed base.css, który z nich korzysta.
// EN: Look-and-feel variables (colors, typography, spacing). They must load before base.css, which uses them.
import './shared/styles/tokens.css';
// PL: Style bazowe aplikacji.
// EN: Base styles of the app.
import './shared/styles/base.css';
// PL: Ekran startowy aplikacji.
// EN: The start screen of the app.
import { App } from './App';

// PL: Znajdź element, w którym ma działać aplikacja.
// EN: Find the element where the app must run.
const rootElement = document.getElementById('root');

// PL: Bez elementu #root nie ma gdzie rysować, więc przerwij z czytelnym błędem.
// EN: Without the #root element there is nowhere to draw, so stop with a clear error.
if (!rootElement) throw new Error('Brak elementu #root w index.html / Missing #root element in index.html');

// PL: Narysuj aplikację w znalezionym elemencie.
// EN: Draw the app in the element found above.
createRoot(rootElement).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
