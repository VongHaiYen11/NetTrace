import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppLayout } from '../layouts/AppLayout';
import { DashboardPage } from '../pages/DashboardPage';
import { TemplatesPage } from '../pages/TemplatesPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      { path: 'dashboard', element: <DashboardPage /> },
      { path: 'templates', element: <TemplatesPage /> },
      { path: 'alarms', element: <Navigate to="/dashboard" replace /> },
      { path: 'export', element: <Navigate to="/dashboard" replace /> },
    ],
  },
]);
