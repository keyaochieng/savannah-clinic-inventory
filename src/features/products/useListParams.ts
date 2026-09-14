import { useSearchParams } from 'react-router-dom';

// The URL query string IS the source of truth for the list view.
// search, category, sort, and page all live in the URL — so a reload,
// or pasting the link on another machine, restores the exact same view.
// Nothing here is React state; it's all read from and written to the URL.
export function useListParams() {
  const [searchParams, setSearchParams] = useSearchParams();

  const search = searchParams.get('q') ?? '';
  const category = searchParams.get('category') ?? '';
  const sort = searchParams.get('sort') ?? '';
  // Coerce to a number and floor at 1 (guards against ?page=abc or ?page=0).
  const page = Math.max(1, Number(searchParams.get('page')) || 1);

  // Update helpers. Each returns a new URL. Note: changing search, category,
  // or sort resets page to 1 — otherwise you could be stranded on page 5 of
  // a filter that only has 1 page (requirement #2).
  function setSearch(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('q', value);
      else next.delete('q');
      // Search wins over category (they don't compose) — clear category.
      next.delete('category');
      next.delete('page');
      return next;
    });
  }

  function setCategory(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('category', value);
      else next.delete('category');
      next.delete('q'); // category clears any active search
      next.delete('page');
      return next;
    });
  }

  function setSort(value: string) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      if (value) next.set('sort', value);
      else next.delete('sort');
      next.delete('page');
      return next;
    });
  }

  function setPage(value: number) {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev);
      next.set('page', String(value));
      return next;
    });
  }

  return {
    search,
    category,
    sort,
    page,
    setSearch,
    setCategory,
    setSort,
    setPage,
  };
}
