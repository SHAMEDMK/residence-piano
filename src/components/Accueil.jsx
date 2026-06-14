import useResidents from '../hooks/useResidents'
import {
  calculateSolde,
  countResidentsWithUnpaidCotisations,
  formatMontant,
} from '../utils/finance'

const nextMonthFormatter = new Intl.DateTimeFormat('fr-FR', {
  month: 'long',
})

function CardIcon({ children }) {
  return (
    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#059669]/10 text-[#059669]">
      {children}
    </div>
  )
}

function WalletIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M4 7h14a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h12" />
      <path d="M16 13h4" />
    </svg>
  )
}

function CalendarIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M8 2v4" />
      <path d="M16 2v4" />
      <path d="M3 10h18" />
      <rect height="18" rx="2" width="18" x="3" y="4" />
    </svg>
  )
}

function ReceiptIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M6 2h12v20l-3-2-3 2-3-2-3 2V2Z" />
      <path d="M9 8h6" />
      <path d="M9 12h6" />
    </svg>
  )
}

function AlertIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M12 9v4" />
      <path d="M12 17h.01" />
      <path d="M10.3 3.9 2.2 18a2 2 0 0 0 1.7 3h16.2a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0Z" />
    </svg>
  )
}

function ToolsIcon() {
  return (
    <svg
      aria-hidden="true"
      className="h-6 w-6"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d="M14.7 6.3a4 4 0 0 0-5 5L3 18l3 3 6.7-6.7a4 4 0 0 0 5-5l-2.4 2.4-3-3 2.4-2.4Z" />
    </svg>
  )
}

function getNextPaymentDeadline(referenceDate = new Date()) {
  const nextMonthDate = new Date(
    referenceDate.getFullYear(),
    referenceDate.getMonth() + 1,
    1,
  )
  const month = nextMonthFormatter.format(nextMonthDate)

  return `5 ${month.charAt(0).toUpperCase()}${month.slice(1)} 2026`
}

function getNextIntervention(interventions, referenceDate = new Date()) {
  const today = referenceDate.toISOString().slice(0, 10)

  return interventions.find((intervention) => intervention.date >= today) ?? null
}

function Accueil({
  cotisations,
  cotisationsError,
  cotisationsLoading,
  depenses,
  depensesError,
  depensesLoading,
  interventions,
  interventionsError,
  interventionsLoading,
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
  )
  const nextIntervention = getNextIntervention(interventions)

  return (
    <section className="w-full space-y-8">
      <div className="rounded-2xl border border-[#A7F3D0] bg-white p-8 shadow-sm md:p-10">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
          Gestion du syndic
        </p>
        <h2 className="mt-3 text-4xl font-bold tracking-tight text-[#064E3B] md:text-6xl">
          Résidence Piano
        </h2>
        <p className="mt-3 text-xl font-semibold text-[#059669]">
          Gestion du syndic
        </p>
        <p className="mt-5 max-w-2xl text-[#064E3B]/80">
          Bonjour, bienvenue sur l'espace syndic de la Résidence Piano.
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-5">
        <article className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
          <CardIcon>
            <WalletIcon />
          </CardIcon>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#059669]">
            Caisse du syndic
          </p>
          <p className="mt-4 text-3xl font-bold text-[#064E3B]">
            {cashError
              ? 'Erreur'
              : cashLoading
                ? 'Chargement...'
                : formatMontant(solde)}
          </p>
          <p className="mt-2 text-sm text-[#064E3B]/70">
            Solde après cotisations payées et dépenses enregistrées.
          </p>
        </article>

        <article className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
          <CardIcon>
            <CalendarIcon />
          </CardIcon>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#059669]">
            Prochaine échéance
          </p>
          <p className="mt-4 text-2xl font-bold text-[#064E3B]">
            {getNextPaymentDeadline()}
          </p>
          <p className="mt-2 text-sm text-[#064E3B]/70">
            Date limite de paiement de la prochaine cotisation.
          </p>
        </article>

        <article className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
          <CardIcon>
            <ReceiptIcon />
          </CardIcon>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#059669]">
            Dernière dépense
          </p>
          {depensesError ? (
            <p className="mt-4 text-sm font-medium text-red-600">
              Impossible de charger les dépenses.
            </p>
          ) : depensesLoading ? (
            <p className="mt-4 text-sm text-[#064E3B]/70">Chargement...</p>
          ) : depenses[0] ? (
            <>
              <h3 className="mt-4 text-lg font-bold text-[#064E3B]">
                {depenses[0].motif}
              </h3>
              <p className="mt-2 text-2xl font-bold text-[#064E3B]">
                {formatMontant(depenses[0].montant)}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-[#064E3B]/70">Aucune dépense enregistrée.</p>
          )}
        </article>

        <article className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
          <CardIcon>
            <AlertIcon />
          </CardIcon>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#059669]">
            Rappel cotisations
          </p>
          <p className="mt-4 text-3xl font-bold text-[#064E3B]">
            {reminderError
              ? 'Erreur'
              : reminderLoading
                ? 'Chargement...'
                : residentsWithUnpaidCotisations}
          </p>
          <p className="mt-2 text-sm text-[#064E3B]/70">
            Appartement(s) avec au moins un mois impayé.
          </p>
        </article>

        <article className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
          <CardIcon>
            <ToolsIcon />
          </CardIcon>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#059669]">
            Prochaine intervention
          </p>
          {interventionsError ? (
            <p className="mt-4 text-sm font-medium text-red-600">
              Impossible de charger le calendrier.
            </p>
          ) : interventionsLoading ? (
            <p className="mt-4 text-sm text-[#064E3B]/70">Chargement...</p>
          ) : nextIntervention ? (
            <>
              <h3 className="mt-4 text-lg font-bold text-[#064E3B]">
                {nextIntervention.titre}
              </h3>
              <p className="mt-2 text-sm font-semibold text-[#064E3B]">
                {nextIntervention.date}
              </p>
              <p className="mt-2 text-sm text-[#064E3B]/70">
                {nextIntervention.type}
              </p>
            </>
          ) : (
            <p className="mt-4 text-sm text-[#064E3B]/70">
              Aucune intervention à venir.
            </p>
          )}
        </article>
      </div>
    </section>
  )
}

export default Accueil
