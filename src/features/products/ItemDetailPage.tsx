import { useState, type FormEvent } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useProduct, useUpdateStock } from './hooks';

export function ItemDetailPage() {
  const { id } = useParams();
  const { data: product, isLoading, isError, refetch } = useProduct(id ?? '');

  // The mutation that saves a new stock count (optimistic update + rollback
  // live inside this hook).
  const updateStock = useUpdateStock(id ?? '');

  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveOk, setSaveOk] = useState(false);

  function handleSave(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaveError(null);
    setSaveOk(false);

    // Read the value straight from the form's input (uncontrolled field).
    const formData = new FormData(event.currentTarget);
    const newStock = Number(formData.get('stock'));

    // Guard against nonsense input before firing the request.
    if (!Number.isInteger(newStock) || newStock < 0) {
      setSaveError('Enter a whole number of 0 or more.');
      return;
    }

    updateStock.mutate(newStock, {
      onSuccess: () => {
        setSaveOk(true);
        setTimeout(() => setSaveOk(false), 3000);
      },
      onError: () => setSaveError('Could not save. The stock count was not changed.'),
    });
  }

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

      {/* Stock correction. The input is uncontrolled and keyed to the current
          stock, so it resets to the latest value whenever the product's stock
          changes — no syncing effect needed. */}
      <form
        onSubmit={handleSave}
        className="max-w-sm space-y-3 rounded-lg border border-slate-200 bg-white p-4"
      >
        <div>
          <label htmlFor="stock" className="mb-1 block text-sm font-medium text-slate-700">
            Correct stock count
          </label>
          <p className="mb-2 text-xs text-slate-500">Set the count to match a physical count.</p>
          <input
            key={product.stock}
            id="stock"
            name="stock"
            type="number"
            min="0"
            step="1"
            defaultValue={product.stock}
            onChange={() => {
              setSaveOk(false);
              setSaveError(null);
            }}
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500"
          />
        </div>

        {saveError && (
          <p role="alert" className="text-sm text-red-600">
            {saveError}
          </p>
        )}
        {saveOk && (
          <p role="status" className="text-sm text-green-600">
            Stock updated.
          </p>
        )}

        <button
          type="submit"
          disabled={updateStock.isPending}
          className="rounded-md bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {updateStock.isPending ? 'Saving…' : 'Save stock count'}
        </button>
      </form>
    </div>
  );
}
