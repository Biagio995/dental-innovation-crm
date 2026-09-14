import { useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import {
  Calendar,
  ClipboardList,
  FileText,
  Home,
  LogOut,
  Menu,
  Phone,
  Users,
  X,
} from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

const navItems = [
  { to: '/', icon: Home, label: 'Dashboard' },
  { to: '/pazienti', icon: Users, label: 'Pazienti' },
  { to: '/agenda', icon: Calendar, label: 'Agenda' },
  { to: '/richiami', icon: Phone, label: 'Richiami' },
  { to: '/template', icon: FileText, label: 'Template' },
  { to: '/storico', icon: ClipboardList, label: 'Storico' },
]

export function AppLayout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  async function handleLogout() {
    await logout()
    navigate('/login', { replace: true })
  }

  const roleLabels: Record<string, string> = {
    owner: 'Titolare',
    admin: 'Amministratore',
    operator: 'Operatore',
  }

  return (
    <div className="app-layout">
      <button
        className="sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label={sidebarOpen ? 'Chiudi menu' : 'Apri menu'}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? <X size={24} /> : <Menu size={24} />}
      </button>

      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2>Dental Innovation</h2>
          <span className="sidebar-subtitle">CRM</span>
        </div>

        <nav className="sidebar-nav" role="navigation" aria-label="Menu principale">
          <ul>
            {navItems.map(({ to, icon: Icon, label }) => (
              <li key={to}>
                <NavLink
                  to={to}
                  className={({ isActive }) =>
                    `nav-link ${isActive ? 'nav-link-active' : ''}`
                  }
                  onClick={() => setSidebarOpen(false)}
                  end={to === '/'}
                >
                  <Icon size={20} aria-hidden="true" />
                  <span>{label}</span>
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar" aria-hidden="true">
              {user?.name.charAt(0).toUpperCase()}
            </div>
            <div className="user-details">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{roleLabels[user?.role || ''] || user?.role}</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-ghost logout-btn"
            aria-label="Esci"
          >
            <LogOut size={20} />
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  )
}
