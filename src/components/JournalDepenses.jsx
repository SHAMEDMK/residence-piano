import { useState } from 'react'
import {
  calculateSolde,
  calculateTotalDepenses,
  countPaidCotisations,
  CATEGORIES_DEPENSES,
  formatMontant,
  MONTANT_COTISATION,
} from '../utils/finance'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const ALL_CATEGORIES_FILTER = 'Toutes'

const categoryBadgeStyles = {
  Ménage: 'bg-blue-50 text-blue-700 ring-blue-100',
  Ascenseur: 'bg-orange-50 text-orange-700 ring-orange-100',
  Réparations: 'bg-red-50 text-red-700 ring-red-100',
  Entretien: 'bg-emerald-50 text-emerald-700 ring-emerald-100',
  Divers: 'bg-slate-100 text-slate-600 ring-slate-200',
}

function JournalDepenses({
  cotisations,
  cotisationsError,
  cotisationsLoading,
  depenses,
  depensesError,
  depensesLoading,
}) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_FILTER)
  const sortedDepenses = [...depenses].sort((a, b) => b.date.localeCompare(a.date))
  const filteredDepenses =
    selectedCategory === ALL_CATEGORIES_FILTER
      ? sortedDepenses
      : sortedDepenses.filter((depense) => depense.categorie === selectedCategory)
  const totalCotisations = countPaidCotisations(cotisations) * MONTANT_COTISATION
  const totalDepenses = calculateTotalDepenses(depenses)
  const solde = calculateSolde(cotisations, depenses)
  const formatAmount = (amount, error, loading) => {
    if (error) {
      return 'Erreur'
    }

    if (loading) {
      return 'Chargement...'
    }

    return formatMontant(amount)
  }
  const soldeError = cotisationsError ?? depensesError
  const soldeLoading = cotisationsLoading || depensesLoading

  return (
    <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-100 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#aa3bff]">
          Journal des dépenses
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#2e0f44]">
          Sorties d'argent de la copropriété
        </h2>
      </div>

      <div className="grid gap-4 border-b border-slate-100 p-6 md:grid-cols-3">
        <div className="rounded-xl bg-[#aa3bff]/10 p-4">
          <p className="text-sm font-medium text-[#922ee0]">Cotisations encaissées</p>
          <p className="mt-2 text-2xl font-bold text-[#2e0f44]">
            {formatAmount(totalCotisations, cotisationsError, cotisationsLoading)}
          </p>
        </div>
        <div className="rounded-xl bg-red-50 p-4">
          <p className="text-sm font-medium text-red-700">Dépenses totales</p>
          <p className="mt-2 text-2xl font-bold text-red-900">
            {formatAmount(totalDepenses, depensesError, depensesLoading)}
          </p>
        </div>
        <div className="rounded-xl bg-emerald-50 p-4">
          <p className="text-sm font-medium text-emerald-700">Solde actuel</p>
          <p className="mt-2 text-2xl font-bold text-emerald-900">
            {formatAmount(solde, soldeError, soldeLoading)}
          </p>
        </div>
      </div>

      {depensesError ? (
        <div className="border-b border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
          Impossible de charger les dépenses : {depensesError.message}
        </div>
      ) : null}

      {depensesLoading ? (
        <div className="border-b border-slate-100 p-6 text-sm text-slate-500">
          Chargement des dépenses...
        </div>
      ) : null}

      <div className="border-b border-slate-100 p-6">
        <p className="text-sm font-semibold text-slate-700">
          Filtrer par catégorie
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[ALL_CATEGORIES_FILTER, ...CATEGORIES_DEPENSES].map((categorie) => (
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === categorie
                  ? 'bg-[#aa3bff] text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-[#aa3bff]/10 hover:text-[#922ee0]'
              }`}
              key={categorie}
              onClick={() => setSelectedCategory(categorie)}
              type="button"
            >
              {categorie}
            </button>
          ))}
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-slate-600">
            <tr>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Motif</th>
              <th className="px-5 py-4 text-right font-semibold">Montant</th>
              <th className="px-5 py-4 font-semibold">Payeur</th>
              <th className="px-5 py-4 font-semibold">Justificatif</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredDepenses.map((depense) => (
              <tr className="hover:bg-slate-50" key={depense.id}>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {dateFormatter.format(new Date(depense.date))}
                </td>
                <td className="px-5 py-4 font-medium text-slate-900">
                  <div className="flex flex-wrap items-center gap-2">
                    <span>{depense.motif}</span>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                        categoryBadgeStyles[depense.categorie] ??
                        categoryBadgeStyles.Divers
                      }`}
                    >
                      {depense.categorie}
                    </span>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-slate-900">
                  {formatMontant(depense.montant)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-slate-600">
                  {depense.payeur}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  {depense.justificatif ? (
                    <a
                      className="font-medium text-[#aa3bff] hover:text-[#922ee0]"
                      href={depense.justificatif}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Voir
                    </a>
                  ) : (
                    <span className="text-slate-400">Aucun</span>
                  )}
                </td>
              </tr>
            ))}
            {!depensesLoading && !depensesError && filteredDepenses.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-8 text-center text-sm text-slate-500"
                  colSpan="5"
                >
                  Aucune dépense pour cette catégorie.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export { MONTANT_COTISATION }
export default JournalDepenses
