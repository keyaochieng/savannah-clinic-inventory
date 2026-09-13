import { useParams } from 'react-router-dom';

export function ItemDetailPage() {
  const { id } = useParams();
  return <p>Item detail for {id} coming soon.</p>;
}
