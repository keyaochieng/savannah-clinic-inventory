import { useQuery, keepPreviousData } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, fetchProduct } from './api';

interface UseProductsParams {
  page: number;
  category: string;
  sort: string;
  search: string;
}

export function useProducts(params: UseProductsParams) {
  return useQuery({
    // The query KEY includes every input. When any of these change, React
    // Query treats it as a different query. Crucially, it only ever shows
    // the result for the CURRENT key — so a slow response for an old search
    // ("asp") can't overwrite the screen once the key has moved on to a
    // newer one ("aspirin"). That's the search-race requirement, handled.
    queryKey: ['products', params],
    queryFn: () => fetchProducts(params),
    // Keep showing the previous page's data while the next loads, instead of
    // flashing a blank loading state on every page/filter change.
    placeholderData: keepPreviousData,
  });
}

export function useCategories() {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
    staleTime: Infinity, // categories don't change during a session
  });
}

export function useProduct(id: string) {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProduct(id),
  });
}
