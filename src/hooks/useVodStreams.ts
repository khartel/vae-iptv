import { getVodStreams } from '../services/xtreamApi'
import { useAsyncResource } from './useAsyncResource'

/** Pass null categoryId to fetch every movie across all categories. */
export function useVodStreams(categoryId: string | null) {
  return useAsyncResource(
    () => getVodStreams(categoryId ?? undefined),
    [categoryId],
    'Failed to load movies.',
  )
}
