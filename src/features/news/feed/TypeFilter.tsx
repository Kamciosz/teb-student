/**
 * PL: Rząd chipów filtra: „Wszystkie”, „Ważne”, „News”, „Wydarzenie”, „Sport” (ekran 2.2). Wybrany chip ma aria-pressed.
 * EN: The row of filter chips: "Wszystkie", "Ważne", "News", "Wydarzenie", "Sport" (screen 2.2). The chosen chip has aria-pressed.
 *
 * @author Szymon
 * @since 2026-10-09
 * @uses src/features/news/feed/types.ts::NEWS_TYPES
 * @used_by src/features/news/feed/FeedListScreen.tsx::TypeFilterRow
 */

// PL: Typy i ich nazwy.
// EN: The types and their names.
import { NEWS_TYPES, NEWS_TYPE_LABELS } from './types';
// PL: Typ wyboru filtra.
// EN: The filter choice type.
import type { TypeFilter } from './filter';

/**
 * PL: Dane rzędu chipów.
 * EN: Chip row data.
 */
export type TypeFilterRowProps = {
  /** PL: Wybrany filtr. EN: The chosen filter. */
  value: TypeFilter;
  /** PL: Wywoływane po wyborze chipa. EN: Called when a chip is chosen. */
  onChange: (next: TypeFilter) => void;
};

/**
 * PL: Rysuje rząd chipów.
 * EN: Draws the chip row.
 *
 * @param props - PL: wybrany filtr i funkcja zmiany. EN: the chosen filter and the change function.
 * @returns PL: drzewo elementów. EN: the element tree.
 */
export function TypeFilterRow({ value, onChange }: TypeFilterRowProps) {
  // PL: Chipy: najpierw „Wszystkie”, potem typy.
  // EN: The chips: "Wszystkie" first, then the types.
  const choices: { id: TypeFilter; label: string }[] = [
    { id: 'all', label: 'Wszystkie' },
    ...NEWS_TYPES.map((type) => ({ id: type, label: NEWS_TYPE_LABELS[type] })),
  ];

  return (
    <div className="news-chips" role="group" aria-label="Filtr typu wpisu">
      {choices.map((choice) => (
        <button
          key={choice.id}
          type="button"
          className="news-chip"
          aria-pressed={value === choice.id}
          onClick={() => onChange(choice.id)}
        >
          {choice.label}
        </button>
      ))}
    </div>
  );
}
