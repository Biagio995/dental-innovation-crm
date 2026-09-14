import { Trash2, UserPlus } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function PazientiPage() {
  const { canDelete } = useAuth()

  return (
    <div className="page">
      <header className="page-header">
        <h1>Pazienti</h1>
        <div className="page-actions">
          <button className="btn btn-primary">
            <UserPlus size={18} />
            Nuovo Paziente
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          <p className="text-muted text-center">
            Gestione pazienti in arrivo nella prossima versione.
          </p>

          <div className="placeholder-table">
            <table>
              <thead>
                <tr>
                  <th>Nome</th>
                  <th>Cognome</th>
                  <th>Telefono</th>
                  <th>Email</th>
                  <th>Azioni</th>
                </tr>
              </thead>
              <tbody>
                <tr className="placeholder-row">
                  <td colSpan={5}>
                    <em>Nessun paziente presente</em>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {!canDelete() && (
            <p className="permission-notice">
              <Trash2 size={16} />
              Come operatore, non hai i permessi per eliminare pazienti.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
