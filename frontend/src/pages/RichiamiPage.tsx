import { PhoneCall } from 'lucide-react'

export function RichiamiPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Richiami</h1>
        <div className="page-actions">
          <button className="btn btn-primary">
            <PhoneCall size={18} />
            Nuovo Richiamo
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          <p className="text-muted text-center">
            Gestione richiami pazienti in arrivo nella prossima versione.
          </p>

          <div className="placeholder-list">
            <div className="placeholder-item">
              <span className="placeholder-icon">📞</span>
              <span>Nessun richiamo programmato</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
