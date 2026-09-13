import { QueryClient } from '@tanstack/react-query';

// Central React Query config. Defaults chosen for an internal tool on
// patchy wifi: keep data briefly fresh to avoid refetch storms, and retry
// once so a single dropped request self-heals without a visible error.
export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000, // 30s: list/detail data doesn't change often here
      retry: 1, // one silent retry before surfacing an error state
      refetchOnWindowFocus: false, // avoid surprise refetches on tab switch
    },
  },
});
