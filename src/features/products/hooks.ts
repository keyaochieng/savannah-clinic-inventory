import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { fetchProducts, fetchCategories, fetchProduct, updateProductStock } from './api';
import type { Product } from './types';

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

export function useUpdateStock(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (newStock: number) => updateProductStock(Number(id), newStock),

    // OPTIMISTIC UPDATE — runs the instant "Save" is clicked, before the
    // server answers. We show the new number immediately so it feels instant
    // on slow wifi.
    onMutate: async (newStock) => {
      // Stop any in-flight refetch of this product so it can't overwrite our
      // optimistic value with stale server data mid-flight.
      await queryClient.cancelQueries({ queryKey: ['product', id] });

      // Snapshot the current value so we can roll back if the save fails.
      const previous = queryClient.getQueryData<Product>(['product', id]);

      // Write the optimistic value straight into the cache — the detail page
      // reads from here, so the UI updates at once.
      queryClient.setQueryData<Product>(['product', id], (old) =>
        old ? { ...old, stock: newStock } : old,
      );

      // Pass the snapshot to onError via context.
      return { previous };
    },

    // If the PUT fails, put the old value back.
    onError: (_err, _newStock, context) => {
      if (context?.previous) {
        queryClient.setQueryData(['product', id], context.previous);
      }
    },
  });
}
