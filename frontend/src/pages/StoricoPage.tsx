export function StoricoPage() {
  return (
    <div className="page">
      <header className="page-header">
        <h1>Storico</h1>
      </header>

      <div className="page-content">
        <div className="card">
          <p className="text-muted text-center">
            Storico comunicazioni in arrivo nella prossima versione.
          </p>

          <div className="placeholder-list">
            <div className="placeholder-item">
              <span className="placeholder-icon">📋</span>
              <span>Nessuna comunicazione registrata</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
