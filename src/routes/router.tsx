import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { StockListPage } from '../features/products/StockListPage';
import { ItemDetailPage } from '../features/products/ItemDetailPage';
import { NotFoundPage } from './NotFoundPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      { index: true, element: <StockListPage /> },
      { path: 'items/:id', element: <ItemDetailPage /> },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
