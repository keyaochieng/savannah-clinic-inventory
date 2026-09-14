// The shape of a product as our UI uses it. DummyJSON returns more fields;
// these are the ones we actually render.
export interface Product {
  id: number;
  title: string;
  description: string;
  price: number;
  stock: number;
  category: string;
  brand?: string;
  thumbnail: string;
}

// The list endpoint wraps results in this envelope. `total` is what we need
// for pagination math (how many pages exist).
export interface ProductListResponse {
  products: Product[];
  total: number;
  skip: number;
  limit: number;
}

export interface Category {
  slug: string;
  name: string;
  url: string;
}
