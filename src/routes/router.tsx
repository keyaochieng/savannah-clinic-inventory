import { createBrowserRouter } from 'react-router-dom';
import { RootLayout } from './RootLayout';
import { StockListPage } from '../features/products/StockListPage';
import { ItemDetailPage } from '../features/products/ItemDetailPage';
import { LoginPage } from '../features/auth/LoginPage';
import { NotFoundPage } from './NotFoundPage';
import { ProtectedRoute } from '../features/auth/ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        index: true,
        element: (
          <ProtectedRoute>
            <StockListPage />
          </ProtectedRoute>
        ),
      },
      { path: 'login', element: <LoginPage /> },
      {
        path: 'items/:id',
        element: (
          <ProtectedRoute>
            <ItemDetailPage />
          </ProtectedRoute>
        ),
      },
      { path: '*', element: <NotFoundPage /> },
    ],
  },
]);
