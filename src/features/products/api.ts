import { apiFetch } from '../../lib/api';
import type { ProductListResponse, Category } from './types';

const PAGE_SIZE = 12;

// The fields we ask the list endpoint for — smaller payloads matter on
// patchy wifi. Detail page fetches the full object separately.
const LIST_FIELDS = 'title,price,stock,category,thumbnail,brand';

interface FetchProductsParams {
  page: number;
  category: string;
  sort: string; // e.g. "price-asc" | "title-desc" | "" for none
  search: string;
}

export async function fetchProducts({
  page,
  category,
  sort,
  search,
}: FetchProductsParams): Promise<ProductListResponse> {
  const skip = (page - 1) * PAGE_SIZE;
  const params = new URLSearchParams({
    limit: String(PAGE_SIZE),
    skip: String(skip),
    select: LIST_FIELDS,
  });

  // Sort maps to sortBy + order. Only add if a sort is chosen.
  if (sort) {
    const [sortBy, order] = sort.split('-');
    params.set('sortBy', sortBy);
    params.set('order', order);
  }

  // Endpoint choice: search and category are separate endpoints on DummyJSON
  // and don't compose. Search takes precedence when present (decision-logged).
  let path: string;
  if (search) {
    params.set('q', search);
    path = `/products/search?${params.toString()}`;
  } else if (category) {
    path = `/products/category/${category}?${params.toString()}`;
  } else {
    path = `/products?${params.toString()}`;
  }

  return apiFetch<ProductListResponse>(path);
}

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/products/categories');
}

export { PAGE_SIZE };
