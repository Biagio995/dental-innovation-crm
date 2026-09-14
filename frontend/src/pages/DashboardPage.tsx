import { useAuth } from '@/context/AuthContext'

export function DashboardPage() {
  const { user, canDelete } = useAuth()

  return (
    <div className="page">
      <header className="page-header">
        <h1>Dashboard</h1>
      </header>

      <div className="page-content">
        <div className="card">
          <h2>Benvenuto, {user?.name}!</h2>
          <p>
            Sei connesso come <strong>{user?.role}</strong>.
          </p>
          {canDelete() ? (
            <p className="text-muted">
              Hai i permessi completi per gestire pazienti e agenda.
            </p>
          ) : (
            <p className="text-muted">
              Come operatore, puoi visualizzare e modificare i dati ma non eliminarli.
            </p>
          )}
        </div>

        <div className="stats-grid">
          <div className="stat-card">
            <span className="stat-value">--</span>
            <span className="stat-label">Pazienti</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">--</span>
            <span className="stat-label">Appuntamenti oggi</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">--</span>
            <span className="stat-label">Richiami pendenti</span>
          </div>
          <div className="stat-card">
            <span className="stat-value">--</span>
            <span className="stat-label">Messaggi inviati</span>
          </div>
        </div>
      </div>
    </div>
  )
}
