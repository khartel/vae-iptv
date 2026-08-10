import { useState } from 'react'
import { Search } from 'lucide-react'
import { useFocusable } from '@noriginmedia/norigin-spatial-navigation'
import { useSpatialInput } from '../hooks/useSpatialInput'
import type { XtreamCategory } from '../types/xtream'

interface CategorySidebarProps {
  status: 'loading' | 'error' | 'success'
  categories: XtreamCategory[]
  errorMessage?: string
  selectedCategoryId: string | null
  onSelectCategory: (categoryId: string | null) => void
  searchPlaceholder: string
  loadingLabel: string
  emptyLabel: string
}

function CategoryButton({
  label,
  active,
  onSelect,
}: {
  label: string
  active: boolean
  onSelect: () => void
}) {
  const { ref } = useFocusable<HTMLButtonElement>({
    onEnterPress: onSelect,
  })

  return (
    <button
      ref={ref}
      type="button"
      onClick={onSelect}
      title={label}
      className={`w-full truncate rounded-xl px-6 py-3 text-left transition-colors outline-none ${
        active
          ? 'bg-surface-container-high text-primary border-primary border-l-4 font-bold'
          : 'text-on-surface-variant hover:bg-surface-container-high'
      }`}
    >
      {label}
    </button>
  )
}

/**
 * The country/category rail reused by Live TV, Movies and Series — search
 * box + "All" + the filtered list, all wired for arrow-key navigation once
 * here instead of three times over (Phase 7 asks for a reusable focus
 * utility, not per-page ad hoc wiring).
 */
export function CategorySidebar({
  status,
  categories,
  errorMessage,
  selectedCategoryId,
  onSelectCategory,
  searchPlaceholder,
  loadingLabel,
  emptyLabel,
}: CategorySidebarProps) {
  const [categoryQuery, setCategoryQuery] = useState('')
  const searchInput = useSpatialInput<HTMLInputElement>()

  const filtered = categoryQuery.trim()
    ? categories.filter((c) =>
        c.category_name
          .toLowerCase()
          .includes(categoryQuery.trim().toLowerCase()),
      )
    : categories

  return (
    <div className="flex h-full w-[240px] shrink-0 flex-col">
      <div className="relative mb-3 shrink-0">
        <Search
          size={16}
          className="text-outline pointer-events-none absolute top-1/2 left-3 -translate-y-1/2"
        />
        <input
          ref={searchInput.ref}
          type="text"
          value={categoryQuery}
          onChange={(e) => setCategoryQuery(e.target.value)}
          onBlur={searchInput.onBlur}
          placeholder={searchPlaceholder}
          className="bg-surface-container-high text-on-surface border-outline-variant/30 focus:border-primary w-full rounded-lg border py-2 pr-3 pl-9 text-sm outline-none"
        />
      </div>

      <div className="no-scrollbar flex-1 space-y-2 overflow-y-auto pb-8">
        <CategoryButton
          label="All"
          active={selectedCategoryId === null}
          onSelect={() => onSelectCategory(null)}
        />

        {status === 'loading' && (
          <p className="text-on-surface-variant px-6 py-3 text-sm">
            {loadingLabel}
          </p>
        )}
        {status === 'error' && (
          <p className="text-error px-6 py-3 text-sm">{errorMessage}</p>
        )}
        {status === 'success' && filtered.length === 0 && (
          <p className="text-on-surface-variant px-6 py-3 text-sm">
            {emptyLabel}
          </p>
        )}
        {status === 'success' &&
          filtered.map((category) => (
            <CategoryButton
              key={category.category_id}
              label={category.category_name}
              active={selectedCategoryId === category.category_id}
              onSelect={() => onSelectCategory(category.category_id)}
            />
          ))}
      </div>
    </div>
  )
}
