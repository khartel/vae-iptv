import { getSeriesList } from '../services/xtreamApi'
import { useAsyncResource } from './useAsyncResource'

/** Pass null categoryId to fetch every series across all categories. */
export function useSeriesList(categoryId: string | null) {
  return useAsyncResource(
    () => getSeriesList(categoryId ?? undefined),
    [categoryId],
    'Failed to load series.',
  )
}
