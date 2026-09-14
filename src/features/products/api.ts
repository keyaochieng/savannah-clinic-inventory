import { apiFetch } from '../../lib/api';
import type { Product, ProductListResponse, Category } from './types';

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

// Pure function: decides the endpoint and query string from the current
// filters. Extracted from fetchProducts so it can be unit-tested without a
// network call. Key rule: search and category are separate endpoints on
// DummyJSON and don't compose — search wins when present (decision-logged).
export function buildProductsPath({ page, category, sort, search }: FetchProductsParams): string {
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

  if (search) {
    params.set('q', search);
    return `/products/search?${params.toString()}`;
  }
  if (category) {
    return `/products/category/${category}?${params.toString()}`;
  }
  return `/products?${params.toString()}`;
}

export async function fetchProducts(params: FetchProductsParams): Promise<ProductListResponse> {
  return apiFetch<ProductListResponse>(buildProductsPath(params));
}

export async function fetchCategories(): Promise<Category[]> {
  return apiFetch<Category[]>('/products/categories');
}

export async function fetchProduct(id: string): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`);
}

export async function updateProductStock(id: number, stock: number): Promise<Product> {
  return apiFetch<Product>(`/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify({ stock }),
  });
}

export { PAGE_SIZE };
