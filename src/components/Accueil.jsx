import useResidents from '../hooks/useResidents'
import {
  calculateSolde,
  countResidentsWithUnpaidCotisations,
  getCurrentCotisationYear,
} from '../utils/finance'

const currencyFormatter = new Intl.NumberFormat('fr-FR', {
  style: 'currency',
  currency: 'EUR',
})

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function getLatestAnnonce(annonces) {
  return annonces[0]
}

function Accueil({
  annonces,
  annoncesError,
  annoncesLoading,
  cotisations,
  cotisationsError,
  cotisationsLoading,
  depenses,
  depensesError,
  depensesLoading,
}) {
  const {
    residents,
    loading: residentsLoading,
    error: residentsError,
  } = useResidents()
  const solde = calculateSolde(cotisations, depenses)
  const cashLoading = cotisationsLoading || depensesLoading
  const cashError = cotisationsError ?? depensesError
  const reminderLoading = cotisationsLoading || residentsLoading
  const reminderError = cotisationsError ?? residentsError
  const residentsWithUnpaidCotisations = countResidentsWithUnpaidCotisations(
    residents,
    cotisations,
    getCurrentCotisationYear(),
  )
  const latestAnnonce = getLatestAnnonce(annonces)

  return (
    <section className="w-full space-y-8">
      <div className="rounded-2xl border border-indigo-100 bg-white p-8 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
          Tableau de bord
        </p>
        <h2 className="mt-3 text-3xl font-bold tracking-tight text-indigo-950">
          Bienvenue sur l'espace syndic
        </h2>
        <p className="mt-3 max-w-2xl text-slate-600">
          Suivez rapidement la caisse, les cotisations et les dernières informations
          partagées avec les résidents.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-indigo-600">
            Caisse du syndic
          </p>
          <p className="mt-4 text-3xl font-bold text-indigo-950">
            {cashError
              ? 'Erreur'
              : cashLoading
                ? 'Chargement...'
                : currencyFormatter.format(solde)}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Solde après cotisations payées et dépenses enregistrées.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-indigo-600">
            Rappel cotisations
          </p>
          <p className="mt-4 text-3xl font-bold text-indigo-950">
            {reminderError
              ? 'Erreur'
              : reminderLoading
                ? 'Chargement...'
                : residentsWithUnpaidCotisations}
          </p>
          <p className="mt-2 text-sm text-slate-500">
            Appartement(s) avec au moins un mois impayé.
          </p>
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-medium uppercase tracking-[0.16em] text-indigo-600">
            Dernière annonce
          </p>
          {annoncesError ? (
            <p className="mt-4 text-sm font-medium text-red-600">
              Impossible de charger les annonces.
            </p>
          ) : annoncesLoading ? (
            <p className="mt-4 text-sm text-slate-500">Chargement...</p>
          ) : latestAnnonce ? (
            <>
              <h3 className="mt-4 text-xl font-bold text-indigo-950">
                {latestAnnonce.titre}
              </h3>
              <p className="mt-2 text-sm text-slate-500">
                {dateFormatter.format(latestAnnonce.date)}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-slate-500">Aucune annonce publiée.</p>
          )}
        </article>
      </div>
    </section>
  )
}

export default Accueil
