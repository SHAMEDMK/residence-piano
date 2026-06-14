import useResidents from '../hooks/useResidents'
import {
  calculateSolde,
  calculateTotalCotisationsExceptionnellesAttendues,
  calculateTotalCotisationsExceptionnellesPayees,
  calculateTotalDepenses,
  countPaidCotisations,
  formatMontant,
  MONTANT_COTISATION,
} from '../utils/finance'

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

function ExceptionalIcon() {
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
      <path d="M12 2v20" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7H14a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  )
}

function Accueil({
  cotisations,
  cotisationsError,
  cotisationsLoading,
  depenses,
  depensesError,
  depensesLoading,
  cotisationsExceptionnelles,
  cotisationsExceptionnellesError,
  cotisationsExceptionnellesLoading,
}) {
  const {
    residents,
    loading: residentsLoading,
    error: residentsError,
  } = useResidents()
  const residentCount = residents.length || 9
  const totalCotisationsMensuelles =
    countPaidCotisations(cotisations) * MONTANT_COTISATION
  const totalCotisationsExceptionnelles =
    calculateTotalCotisationsExceptionnellesPayees(cotisationsExceptionnelles)
  const totalCotisationsExceptionnellesAttendues =
    calculateTotalCotisationsExceptionnellesAttendues(
      cotisationsExceptionnelles,
      residentCount,
    )
  const totalDepenses = calculateTotalDepenses(depenses)
  const soldeApresDepenses = calculateSolde(
    cotisations,
    depenses,
    cotisationsExceptionnelles,
  )
  const cashLoading =
    cotisationsLoading || cotisationsExceptionnellesLoading || depensesLoading
  const cashError =
    cotisationsError ?? cotisationsExceptionnellesError ?? depensesError
  const exceptionalLoading = cotisationsExceptionnellesLoading || residentsLoading
  const exceptionalError = cotisationsExceptionnellesError ?? residentsError
  const exceptionalProgress =
    totalCotisationsExceptionnellesAttendues > 0
      ? Math.round(
          (totalCotisationsExceptionnelles /
            totalCotisationsExceptionnellesAttendues) *
            100,
        )
      : 0

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

      <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
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
                : formatMontant(soldeApresDepenses)}
          </p>
          <p className="mt-2 text-sm text-[#064E3B]/70">
            Solde réel disponible après déduction des dépenses.
          </p>
          {!cashError && !cashLoading ? (
            <p
              className="mt-3 text-xs font-medium leading-6 text-[#064E3B]/70"
              title={`Mensuelles : ${formatMontant(
                totalCotisationsMensuelles,
              )} + Exceptionnelles : ${formatMontant(
                totalCotisationsExceptionnelles,
              )} - Dépenses : ${formatMontant(totalDepenses)}`}
            >
              Mensuelles : {formatMontant(totalCotisationsMensuelles)} +
              Exceptionnelles : {formatMontant(totalCotisationsExceptionnelles)} -
              Dépenses : {formatMontant(totalDepenses)}
            </p>
          ) : null}
        </article>

        <article className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
          <CardIcon>
            <CalendarIcon />
          </CardIcon>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#059669]">
            Cotisations mensuelles encaissées
          </p>
          <p className="mt-4 text-3xl font-bold text-[#064E3B]">
            {cotisationsError
              ? 'Erreur'
              : cotisationsLoading
                ? 'Chargement...'
                : formatMontant(totalCotisationsMensuelles)}
          </p>
          <p className="mt-2 text-sm text-[#064E3B]/70">
            Cotisations payées × {formatMontant(MONTANT_COTISATION)}.
          </p>
        </article>

        <article className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
          <CardIcon>
            <ExceptionalIcon />
          </CardIcon>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#059669]">
            Cotisations exceptionnelles encaissées
          </p>
          {exceptionalError ? (
            <p className="mt-4 text-sm font-medium text-red-600">
              Impossible de charger les cotisations exceptionnelles.
            </p>
          ) : exceptionalLoading ? (
            <p className="mt-4 text-sm text-[#064E3B]/70">Chargement...</p>
          ) : (
            <>
              <p className="mt-4 text-3xl font-bold text-[#064E3B]">
                {formatMontant(totalCotisationsExceptionnelles)}
              </p>
              <p className="mt-2 text-sm text-[#064E3B]/70">
                {formatMontant(totalCotisationsExceptionnelles)} /{' '}
                {formatMontant(totalCotisationsExceptionnellesAttendues)} attendus
              </p>
              <div className="mt-4 h-3 overflow-hidden rounded-full bg-[#ECFDF5]">
                <div
                  className="h-full rounded-full bg-[#22C55E] transition-all"
                  style={{ width: `${exceptionalProgress}%` }}
                />
              </div>
              <p className="mt-2 text-xs font-semibold text-[#064E3B]/70">
                {exceptionalProgress}% encaissé
              </p>
            </>
          )}
        </article>

        <article className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
          <CardIcon>
            <ReceiptIcon />
          </CardIcon>
          <p className="mt-5 text-sm font-medium uppercase tracking-[0.16em] text-[#059669]">
            Total dépenses
          </p>
          <p className="mt-4 text-3xl font-bold text-[#064E3B]">
            {depensesError
              ? 'Erreur'
              : depensesLoading
                ? 'Chargement...'
                : formatMontant(totalDepenses)}
          </p>
          <p className="mt-2 text-sm text-[#064E3B]/70">
            Total des sorties d'argent enregistrées.
          </p>
        </article>
      </div>
    </section>
  )
}

export default Accueil
