/**
 * PL: Drzwi wspólnej części aplikacji w telefonie (podtor 0). Inne moduły importują stąd, a nie z plików w środku.
 * EN: The door of the shared part of the phone app (subtrack 0). Other modules import from here, not from files inside.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/ui/UnderConstruction.tsx::UnderConstruction
 * @uses src/shared/ui/Dock.tsx::Dock
 * @uses src/shared/ui/Icon.tsx::Icon
 * @uses src/shared/navigation/items.ts::DOCK_ITEMS
 * @uses src/shared/query/AppQueryProvider.tsx::AppQueryProvider
 * @uses src/shared/query/clearQueryData.ts::clearQueryData
 * @uses src/shared/ui/OfflineBanner.tsx::OfflineBanner
 * @uses src/shared/ui/Button.tsx::Button
 * @uses src/shared/ui/Chip.tsx::Chip
 * @uses src/shared/ui/TextField.tsx::TextField
 * @uses src/shared/ui/Tile.tsx::Tile
 * @uses src/shared/ui/Badge.tsx::Badge
 * @uses src/shared/ui/ProgressBar.tsx::ProgressBar
 * @uses src/shared/ui/ProgressBar.tsx::clampPercent
 * @uses src/shared/ui/Sheet.tsx::Sheet
 * @uses src/shared/ui/EmptyState.tsx::EmptyState
 * @uses src/shared/ui/ListGroup.tsx::ListGroup
 * @uses src/shared/ui/ListRow.tsx::ListRow
 * @used_by src/features/dashboard/index.ts::DashboardScreen
 * @used_by src/app/routes.test.ts::DOCK_ITEMS
 */

// PL: Ekran „W budowie”, dopóki podtor nie ma własnego ekranu.
// EN: The "W budowie" screen until a subtrack has its own screen.
export { UnderConstruction } from './ui/UnderConstruction';
// PL: Dolny pasek nawigacji.
// EN: The bottom navigation bar.
export { Dock } from './ui/Dock';
// PL: Wpisy dolnego paska i menu panelu oraz typ wpisu.
// EN: The bottom bar and panel menu entries and the entry type.
export { DOCK_ITEMS, PANEL_MENU_ITEMS, type NavigationItem, type DockItem } from './navigation/items';
// PL: Wspólne ikony aplikacji i ich nazwy.
// EN: The shared app icons and their names.
export { Icon, type IconName } from './ui/Icon';
// PL: Dostawca zapytań z zapisem w telefonie. Stoi tylko w korzeniu aplikacji (App.tsx).
// EN: The query provider with saving on the phone. It stands only at the app root (App.tsx).
export { AppQueryProvider } from './query/AppQueryProvider';
// PL: Czyszczenie zapisanych danych: wywołaj przy wylogowaniu i usunięciu konta.
// EN: Clearing the saved data: call it on sign-out and account deletion.
export { clearQueryData } from './query/clearQueryData';
// PL: Pasek braku internetu (jeden, w korzeniu aplikacji).
// EN: The no-internet bar (one, at the app root).
export { OfflineBanner } from './ui/OfflineBanner';
// PL: Przycisk w trzech wariantach (filled, plain, destructive).
// EN: The button in three variants (filled, plain, destructive).
export { Button } from './ui/Button';
// PL: Wybieralny znacznik (wybrany albo nie).
// EN: The selectable chip (selected or not).
export { Chip } from './ui/Chip';
// PL: Pole tekstowe z etykietą i komunikatem o błędzie.
// EN: The text field with a label and an error message.
export { TextField } from './ui/TextField';
// PL: Kafelek (karta) z tłem i zawijaniem tekstu.
// EN: The tile (card) with a background and text wrapping.
export { Tile } from './ui/Tile';
// PL: Mała etykieta statusu w kształcie pigułki.
// EN: The small status label in a pill shape.
export { Badge } from './ui/Badge';
// PL: Pasek postępu z odczytem dla czytnika; clampPercent przycina wartość do 0–100 %.
// EN: The progress bar with reading for the screen reader; clampPercent clips the value to 0–100%.
export { ProgressBar, clampPercent } from './ui/ProgressBar';
// PL: Arkusz wysuwany z dołu (modalne okno z fokusem i Escape).
// EN: The sheet sliding up from the bottom (a modal window with focus and Escape).
export { Sheet } from './ui/Sheet';
// PL: Pusty stan z tytułem i treścią dodatkową.
// EN: The empty state with a title and extra content.
export { EmptyState } from './ui/EmptyState';
// PL: Grupowana lista w stylu iOS (nagłówek, blok wierszy, przypis).
// EN: The grouped list in the iOS style (header, block of rows, footnote).
export { ListGroup } from './ui/ListGroup';
// PL: Wiersz grupowanej listy: tytuł, wartość, strzałka albo akcja.
// EN: The row of a grouped list: a title, a value, an arrow or an action.
export { ListRow } from './ui/ListRow';
