import { getSeriesCategories } from '../services/xtreamApi'
import { useAsyncResource } from './useAsyncResource'

export function useSeriesCategories() {
  return useAsyncResource(
    () => getSeriesCategories(),
    [],
    'Failed to load series categories.',
  )
}
