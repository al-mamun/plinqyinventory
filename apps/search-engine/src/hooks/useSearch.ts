import { useQuery } from '@tanstack/react-query'
import { searchService, SearchParams } from '@/services/searchService'

export function useSearch(params: SearchParams) {
  return useQuery({
    queryKey: ['search', params],
    queryFn: () => searchService.search(params),
    enabled: !!params.query && params.query.length >= 2,
  })
}
