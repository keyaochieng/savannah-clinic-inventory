import { Link } from 'react-router-dom';

export function NotFoundPage() {
  return (
    <div className="space-y-3">
      <p className="text-slate-600">That page doesn’t exist.</p>
      <Link to="/" className="text-brand-600 underline">
        Back to stock list
      </Link>
    </div>
  );
}
