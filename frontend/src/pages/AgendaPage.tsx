import { CalendarPlus, Trash2 } from 'lucide-react'
import { useAuth } from '@/context/AuthContext'

export function AgendaPage() {
  const { canDelete } = useAuth()

  return (
    <div className="page">
      <header className="page-header">
        <h1>Agenda</h1>
        <div className="page-actions">
          <button className="btn btn-primary">
            <CalendarPlus size={18} />
            Nuovo Appuntamento
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          <p className="text-muted text-center">
            Calendario appuntamenti in arrivo nella prossima versione.
          </p>

          <div className="calendar-placeholder">
            <div className="calendar-header">
              <span>Settembre 2026</span>
            </div>
            <div className="calendar-grid">
              {['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'].map((day) => (
                <div key={day} className="calendar-day-header">
                  {day}
                </div>
              ))}
              {Array.from({ length: 30 }, (_, i) => (
                <div key={i} className="calendar-day">
                  {i + 1}
                </div>
              ))}
            </div>
          </div>

          {!canDelete() && (
            <p className="permission-notice">
              <Trash2 size={16} />
              Come operatore, non hai i permessi per eliminare appuntamenti.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
