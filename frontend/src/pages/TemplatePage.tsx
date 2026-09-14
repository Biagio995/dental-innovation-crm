import { FilePlus } from 'lucide-react'

export function TemplatePage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Template</h1>
        <div className="page-actions">
          <button className="btn btn-primary">
            <FilePlus size={18} />
            Nuovo Template
          </button>
        </div>
      </header>

      <div className="page-content">
        <div className="card">
          <p className="text-muted text-center">
            Gestione template comunicazioni in arrivo nella prossima versione.
          </p>

          <div className="placeholder-list">
            <div className="placeholder-item">
              <span className="placeholder-icon">📄</span>
              <span>Nessun template presente</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
