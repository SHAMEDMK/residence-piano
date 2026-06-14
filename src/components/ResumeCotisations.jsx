import {
  formatMontant,
  getCotisationStatus,
  getCurrentCotisationMonth,
  MONTANT_COTISATION,
} from '../utils/finance'

function ResumeCotisations({ cotisations, residents }) {
  const currentMonth = getCurrentCotisationMonth()

  if (!currentMonth) {
    return (
      <div className="mb-8 rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
        Le mois en cours n'est pas dans la période de cotisations affichée.
      </div>
    )
  }

  const paidCount = residents.filter(
    (resident) =>
      getCotisationStatus(
        cotisations,
        resident.id,
        currentMonth.mois,
        currentMonth.annee,
      ) === 'paye',
  ).length
  const unpaidCount = residents.filter(
    (resident) =>
      getCotisationStatus(
        cotisations,
        resident.id,
        currentMonth.mois,
        currentMonth.annee,
      ) === 'impaye',
  ).length

  return (
    <section className="mb-8 grid gap-4 md:grid-cols-3">
      <article className="rounded-2xl border border-emerald-100 bg-emerald-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">
          Total perçu ce mois
        </p>
        <p className="mt-3 text-3xl font-bold text-emerald-950">
          {formatMontant(paidCount * MONTANT_COTISATION)}
        </p>
        <p className="mt-2 text-sm text-emerald-700">{currentMonth.label}</p>
      </article>

      <article className="rounded-2xl border border-red-100 bg-red-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-red-700">
          Total impayés ce mois
        </p>
        <p className="mt-3 text-3xl font-bold text-red-950">
          {formatMontant(unpaidCount * MONTANT_COTISATION)}
        </p>
        <p className="mt-2 text-sm text-red-700">{currentMonth.label}</p>
      </article>

      <article className="rounded-2xl border border-blue-100 bg-blue-50 p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-[0.16em] text-blue-700">
          Appartements en règle
        </p>
        <p className="mt-3 text-3xl font-bold text-blue-950">
          {paidCount}/{residents.length}
        </p>
        <p className="mt-2 text-sm text-blue-700">Cotisation du mois payée</p>
      </article>
    </section>
  )
}

export default ResumeCotisations
