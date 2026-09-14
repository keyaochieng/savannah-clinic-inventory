import { Link, useParams } from 'react-router-dom';
import { useProduct } from './hooks';

export function ItemDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading, isError, refetch } = useProduct(id ?? '');

  if (isLoading) {
    return <p className="py-12 text-center text-slate-500">Loading item…</p>;
  }

  if (isError || !product) {
    return (
      <div className="py-12 text-center">
        <p className="mb-3 text-slate-700">Couldn’t load this item.</p>
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => refetch()}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
          >
            Try again
          </button>
          <Link to="/" className="text-sm text-brand-600 underline">
            Back to stock list
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Link to="/" className="text-sm text-brand-600 hover:underline">
        ← Back to stock list
      </Link>

      <div className="flex flex-col gap-6 sm:flex-row">
        <img
          src={product.thumbnail}
          alt={product.title}
          className="h-48 w-48 rounded-lg border border-slate-200 object-cover"
        />

        <div className="flex-1 space-y-3">
          <div>
            <h2 className="text-2xl font-semibold text-slate-900">{product.title}</h2>
            <p className="text-sm capitalize text-slate-500">{product.category}</p>
          </div>

          <p className="text-slate-700">{product.description}</p>

          <dl className="grid grid-cols-2 gap-3 pt-2 text-sm sm:max-w-xs">
            <dt className="text-slate-500">Price</dt>
            <dd className="font-medium text-slate-900">${product.price}</dd>

            <dt className="text-slate-500">Current stock</dt>
            <dd className="font-medium text-slate-900">{product.stock}</dd>

            {product.brand && (
              <>
                <dt className="text-slate-500">Brand</dt>
                <dd className="font-medium text-slate-900">{product.brand}</dd>
              </>
            )}
          </dl>
        </div>
      </div>

      {/* Stock correction form goes here in the next branch */}
    </div>
  );
}
