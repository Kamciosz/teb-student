/**
 * PL: Drzwi wspólnej części aplikacji w telefonie (podtor 0). Inne moduły importują stąd, a nie z plików w środku.
 * EN: The door of the shared part of the phone app (subtrack 0). Other modules import from here, not from files inside.
 *
 * @author Bohdan
 * @since 2026-10-09
 * @uses src/shared/ui/UnderConstruction.tsx::UnderConstruction
 * @uses src/shared/ui/Dock.tsx::Dock
 * @uses src/shared/navigation/items.ts::DOCK_ITEMS
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
export { DOCK_ITEMS, PANEL_MENU_ITEMS, type NavigationItem } from './navigation/items';
