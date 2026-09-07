/**
 * Page Dashboard (Tableau de bord)
 * À compléter avec les statistiques et graphiques
 */
const DashboardPage = () => {
  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>
          <i className="bi bi-house-door" aria-hidden="true"></i> Tableau de bord
        </h1>
        <span className="text-muted">Bienvenue !</span>
      </div>

      {/* Cartes de statistiques (exemple) */}
      <div className="row g-4">
        <div className="col-md-3 col-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h2 className="text-primary">0</h2>
              <p className="text-muted mb-0">Visites totales</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h2 className="text-success">0</h2>
              <p className="text-muted mb-0">Visites réalisées</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h2 className="text-warning">0</h2>
              <p className="text-muted mb-0">En attente</p>
            </div>
          </div>
        </div>
        <div className="col-md-3 col-6">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <h2 className="text-danger">0</h2>
              <p className="text-muted mb-0">En retard</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 alert alert-info">
        <i className="bi bi-info-circle" aria-hidden="true"></i>
        Page Dashboard en cours de construction...
      </div>
    </div>
  );
};

// ✅ EXPORT PAR DÉFAUT
export default DashboardPage;