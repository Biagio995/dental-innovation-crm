import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '@/components/AppLayout'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { LoginPage } from '@/pages/LoginPage'
import { DashboardPage } from '@/pages/DashboardPage'
import { PazientiPage } from '@/pages/PazientiPage'
import { PatientDetailPage } from '@/pages/PatientDetailPage'
import { AgendaPage } from '@/pages/AgendaPage'
import { RichiamiPage } from '@/pages/RichiamiPage'
import { TemplatePage } from '@/pages/TemplatePage'
import { StoricoPage } from '@/pages/StoricoPage'

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/',
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      {
        index: true,
        element: <DashboardPage />,
      },
      {
        path: 'pazienti',
        element: <PazientiPage />,
      },
      {
        path: 'pazienti/:id',
        element: <PatientDetailPage />,
      },
      {
        path: 'agenda',
        element: <AgendaPage />,
      },
      {
        path: 'richiami',
        element: <RichiamiPage />,
      },
      {
        path: 'template',
        element: <TemplatePage />,
      },
      {
        path: 'storico',
        element: <StoricoPage />,
      },
    ],
  },
])
