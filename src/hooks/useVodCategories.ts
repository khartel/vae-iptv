import { getVodCategories } from '../services/xtreamApi'
import { useAsyncResource } from './useAsyncResource'

export function useVodCategories() {
  return useAsyncResource(
    () => getVodCategories(),
    [],
    'Failed to load movie categories.',
  )
}
