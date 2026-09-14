import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useProducts, useCategories } from './hooks';
import { useListParams } from './useListParams';
import { PAGE_SIZE } from './api';

export function StockListPage() {
  const { search, category, sort, page, setSearch, setCategory, setSort, setPage } =
    useListParams();

  // Controlled input value. Kept in local state so typing is instant and the
  // input keeps focus (no remounting).
  const [searchInput, setSearchInput] = useState(search);

  // Debounce typing into the URL. 350ms after the user stops, push to the URL
  // (which triggers the fetch). Combined with the query key, this makes search
  // race-safe on slow connections.
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) setSearch(searchInput);
    }, 350);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchInput]);

  const { data, isLoading, isError, refetch, isPlaceholderData } = useProducts({
    page,
    category,
    sort,
    search,
  });
  const { data: categories } = useCategories();

  const totalPages = data ? Math.ceil(data.total / PAGE_SIZE) : 0;

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="flex-1">
          <label htmlFor="search" className="mb-1 block text-sm font-medium text-slate-700">
            Search stock
          </label>
          <input
            id="search"
            type="search"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search by name…"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        <div>
          <label htmlFor="category" className="mb-1 block text-sm font-medium text-slate-700">
            Category
          </label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">All categories</option>
            {categories?.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="sort" className="mb-1 block text-sm font-medium text-slate-700">
            Sort
          </label>
          <select
            id="sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          >
            <option value="">Default</option>
            <option value="title-asc">Name (A–Z)</option>
            <option value="title-desc">Name (Z–A)</option>
            <option value="price-asc">Price (low–high)</option>
            <option value="price-desc">Price (high–low)</option>
            <option value="stock-asc">Stock (low–high)</option>
            <option value="stock-desc">Stock (high–low)</option>
          </select>
        </div>
      </div>

      {/* States: loading / error / empty / data */}
      {isLoading ? (
        <p className="py-12 text-center text-slate-500">Loading stock…</p>
      ) : isError ? (
        <div className="py-12 text-center">
          <p className="mb-3 text-slate-700">Couldn’t load stock.</p>
          <button
            onClick={() => refetch()}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Try again
          </button>
        </div>
      ) : data && data.products.length === 0 ? (
        <p className="py-12 text-center text-slate-500">No items match your search or filter.</p>
      ) : (
        <>
          <ul
            className={`grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 ${
              isPlaceholderData ? 'opacity-60' : ''
            }`}
          >
            {data?.products.map((product) => (
              <li key={product.id}>
                <Link
                  to={`/items/${product.id}`}
                  className="block rounded-lg border border-slate-200 bg-white p-4 hover:border-brand-400 hover:shadow-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                >
                  <div className="flex gap-3">
                    <img
                      src={product.thumbnail}
                      alt=""
                      className="h-16 w-16 rounded object-cover"
                    />
                    <div className="min-w-0">
                      <p className="truncate font-medium text-slate-900">{product.title}</p>
                      <p className="text-sm capitalize text-slate-500">{product.category}</p>
                      <p className="mt-1 text-sm">
                        <span className="font-semibold">{product.stock}</span>
                        <span className="text-slate-500"> in stock</span>
                      </p>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-4 pt-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page <= 1}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-slate-600">
                Page {page} of {totalPages}
              </span>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page >= totalPages}
                className="rounded-md border border-slate-300 px-3 py-1.5 text-sm disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
