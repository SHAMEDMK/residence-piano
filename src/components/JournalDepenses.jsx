import { useEffect, useRef, useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'
import {
  calculateSolde,
  calculateTotalCotisationsExceptionnellesPayees,
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
  Divers: 'bg-[#ECFDF5] text-[#064E3B]/75 ring-slate-200',
}

function JournalDepenses({
  cotisations,
  cotisationsError,
  cotisationsLoading,
  cotisationsExceptionnelles,
  cotisationsExceptionnellesError,
  cotisationsExceptionnellesLoading,
  depenses,
  depensesError,
  depensesLoading,
  isSyndic,
  onDelete,
  onEdit,
}) {
  const [selectedCategory, setSelectedCategory] = useState(ALL_CATEGORIES_FILTER)
  const [pendingDeleteDepenseId, setPendingDeleteDepenseId] = useState(null)
  const [deletingDepenseId, setDeletingDepenseId] = useState(null)
  const [actionError, setActionError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const successTimerRef = useRef(null)
  const sortedDepenses = [...depenses].sort((a, b) => b.date.localeCompare(a.date))
  const filteredDepenses =
    selectedCategory === ALL_CATEGORIES_FILTER
      ? sortedDepenses
      : sortedDepenses.filter((depense) => depense.categorie === selectedCategory)
  const totalCotisationsMensuelles =
    countPaidCotisations(cotisations) * MONTANT_COTISATION
  const totalCotisationsExceptionnelles =
    calculateTotalCotisationsExceptionnellesPayees(cotisationsExceptionnelles)
  const totalCotisations =
    totalCotisationsMensuelles + totalCotisationsExceptionnelles
  const totalDepenses = calculateTotalDepenses(depenses)
  const solde = calculateSolde(cotisations, depenses, cotisationsExceptionnelles)
  const formatAmount = (amount, error, loading) => {
    if (error) {
      return 'Erreur'
    }

    if (loading) {
      return 'Chargement...'
    }

    return formatMontant(amount)
  }
  const cotisationsErrorMessage = cotisationsError ?? cotisationsExceptionnellesError
  const cotisationsLoadingState =
    cotisationsLoading || cotisationsExceptionnellesLoading
  const soldeError = cotisationsErrorMessage ?? depensesError
  const soldeLoading = cotisationsLoadingState || depensesLoading

  const showSuccessMessage = (message) => {
    if (successTimerRef.current) {
      window.clearTimeout(successTimerRef.current)
    }

    setSuccessMessage(message)
    successTimerRef.current = window.setTimeout(() => {
      setSuccessMessage('')
      successTimerRef.current = null
    }, 3000)
  }

  useEffect(
    () => () => {
      if (successTimerRef.current) {
        window.clearTimeout(successTimerRef.current)
      }
    },
    [],
  )

  const confirmDelete = async (depenseId) => {
    setDeletingDepenseId(depenseId)
    setActionError(null)

    try {
      await deleteDoc(doc(db, 'depenses', depenseId))
      setPendingDeleteDepenseId(null)
      onDelete?.(depenseId)
      showSuccessMessage('Dépense supprimée avec succès.')
    } catch (deleteError) {
      setActionError(deleteError)
    } finally {
      setDeletingDepenseId(null)
    }
  }

  return (
    <section className="w-full rounded-2xl border border-[#A7F3D0] bg-white shadow-sm">
      <div className="border-b border-[#A7F3D0]/50 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
          Journal des dépenses
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#064E3B]">
          Sorties d'argent de la copropriété
        </h2>
      </div>

      <div className="grid gap-4 border-b border-[#A7F3D0]/50 p-6 md:grid-cols-3">
        <div className="rounded-xl bg-[#059669]/10 p-4">
          <p className="text-sm font-medium text-[#047857]">Cotisations encaissées</p>
          <p className="mt-2 text-2xl font-bold text-[#064E3B]">
            {formatAmount(
              totalCotisations,
              cotisationsErrorMessage,
              cotisationsLoadingState,
            )}
          </p>
          <p className="mt-1 text-xs font-medium text-[#064E3B]/70">
            Mensuelles + exceptionnelles
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

      {actionError ? (
        <div className="border-b border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
          Impossible de supprimer la dépense : {actionError.message}
        </div>
      ) : null}

      {successMessage ? (
        <div className="border-b border-emerald-100 bg-emerald-50 p-6 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      {depensesLoading ? (
        <div className="border-b border-[#A7F3D0]/50 p-6 text-sm text-[#064E3B]/70">
          Chargement des dépenses...
        </div>
      ) : null}

      <div className="border-b border-[#A7F3D0]/50 p-6">
        <p className="text-sm font-semibold text-[#064E3B]/80">
          Filtrer par catégorie
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          {[ALL_CATEGORIES_FILTER, ...CATEGORIES_DEPENSES].map((categorie) => (
            <button
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                selectedCategory === categorie
                  ? 'bg-[#059669] text-white shadow-sm'
                  : 'bg-[#ECFDF5] text-[#064E3B]/75 hover:bg-[#059669]/10 hover:text-[#047857]'
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

      <div className="divide-y divide-[#A7F3D0]/50 md:hidden">
        {filteredDepenses.map((depense) => (
          <article className="p-4" key={depense.id}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-[#064E3B]/70">
                  {dateFormatter.format(new Date(depense.date))}
                </p>
                <h3 className="mt-2 text-lg font-bold text-[#064E3B]">
                  {depense.motif}
                </h3>
              </div>
              {isSyndic ? (
                <div className="flex shrink-0 gap-2">
                  <button
                    aria-label={`Modifier ${depense.motif}`}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-[#ECFDF5] text-sm transition hover:bg-[#059669]/10"
                    onClick={() => onEdit?.(depense)}
                    type="button"
                  >
                    ✏️
                  </button>
                  <button
                    aria-label={`Supprimer ${depense.motif}`}
                    className="flex min-h-11 min-w-11 items-center justify-center rounded-full bg-red-50 text-sm transition hover:bg-red-100"
                    onClick={() => setPendingDeleteDepenseId(depense.id)}
                    type="button"
                  >
                    🗑️
                  </button>
                </div>
              ) : null}
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                  categoryBadgeStyles[depense.categorie] ??
                  categoryBadgeStyles.Divers
                }`}
              >
                {depense.categorie}
              </span>
              <span className="text-sm text-[#064E3B]/70">Payeur : {depense.payeur}</span>
            </div>

            <p className="mt-4 text-2xl font-bold text-[#064E3B]">
              {formatMontant(depense.montant)}
            </p>

            <div className="mt-3 text-sm">
              {depense.justificatif ? (
                <a
                  className="font-medium text-[#059669] hover:text-[#047857]"
                  href={depense.justificatif}
                  rel="noreferrer"
                  target="_blank"
                >
                  Voir le justificatif
                </a>
              ) : (
                <span className="text-[#14B8A6]/70">Aucun justificatif</span>
              )}
            </div>

            {pendingDeleteDepenseId === depense.id ? (
              <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                <p className="text-sm font-semibold text-red-700">
                  Supprimer cette dépense ?
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <button
                    className="min-h-11 rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#064E3B]/75 transition hover:bg-[#ECFDF5]"
                    onClick={() => setPendingDeleteDepenseId(null)}
                    type="button"
                  >
                    Annuler
                  </button>
                  <button
                    className="min-h-11 rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={deletingDepenseId === depense.id}
                    onClick={() => confirmDelete(depense.id)}
                    type="button"
                  >
                    {deletingDepenseId === depense.id
                      ? 'Suppression...'
                      : 'Confirmer'}
                  </button>
                </div>
              </div>
            ) : null}
          </article>
        ))}

        {!depensesLoading && !depensesError && filteredDepenses.length === 0 ? (
          <p className="p-6 text-center text-sm text-[#064E3B]/70">
            Aucune dépense pour cette catégorie.
          </p>
        ) : null}
      </div>

      <div className="hidden overflow-x-auto md:block">
        <table className="min-w-full border-collapse text-left text-sm">
          <thead className="bg-[#F0FDF4] text-[#064E3B]/75">
            <tr>
              <th className="px-5 py-4 font-semibold">Date</th>
              <th className="px-5 py-4 font-semibold">Motif</th>
              <th className="px-5 py-4 text-right font-semibold">Montant</th>
              <th className="px-5 py-4 font-semibold">Payeur</th>
              <th className="px-5 py-4 font-semibold">Justificatif</th>
              {isSyndic ? (
                <th className="px-5 py-4 text-right font-semibold">Actions</th>
              ) : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#A7F3D0]/50">
            {filteredDepenses.map((depense) => (
              <tr className="hover:bg-[#F0FDF4]" key={depense.id}>
                <td className="whitespace-nowrap px-5 py-4 text-[#064E3B]/75">
                  {dateFormatter.format(new Date(depense.date))}
                </td>
                <td className="px-5 py-4 font-medium text-[#064E3B]">
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
                    {pendingDeleteDepenseId === depense.id ? (
                      <div className="mt-2 w-full rounded-xl border border-red-100 bg-red-50 p-4">
                        <p className="text-sm font-semibold text-red-700">
                          Supprimer cette dépense ?
                        </p>
                        <div className="mt-3 flex flex-wrap gap-2">
                          <button
                            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#064E3B]/75 transition hover:bg-[#ECFDF5]"
                            onClick={() => setPendingDeleteDepenseId(null)}
                            type="button"
                          >
                            Annuler
                          </button>
                          <button
                            className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                            disabled={deletingDepenseId === depense.id}
                            onClick={() => confirmDelete(depense.id)}
                            type="button"
                          >
                            {deletingDepenseId === depense.id
                              ? 'Suppression...'
                              : 'Confirmer'}
                          </button>
                        </div>
                      </div>
                    ) : null}
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right font-semibold text-[#064E3B]">
                  {formatMontant(depense.montant)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-[#064E3B]/75">
                  {depense.payeur}
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  {depense.justificatif ? (
                    <a
                      className="font-medium text-[#059669] hover:text-[#047857]"
                      href={depense.justificatif}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Voir
                    </a>
                  ) : (
                    <span className="text-[#14B8A6]/70">Aucun</span>
                  )}
                </td>
                {isSyndic ? (
                  <td className="whitespace-nowrap px-5 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        aria-label={`Modifier ${depense.motif}`}
                        className="rounded-full bg-[#ECFDF5] px-3 py-2 text-sm transition hover:bg-[#059669]/10"
                        onClick={() => onEdit?.(depense)}
                        type="button"
                      >
                        ✏️
                      </button>
                      <button
                        aria-label={`Supprimer ${depense.motif}`}
                        className="rounded-full bg-red-50 px-3 py-2 text-sm transition hover:bg-red-100"
                        onClick={() => setPendingDeleteDepenseId(depense.id)}
                        type="button"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                ) : null}
              </tr>
            ))}
            {!depensesLoading && !depensesError && filteredDepenses.length === 0 ? (
              <tr>
                <td
                  className="px-5 py-8 text-center text-sm text-[#064E3B]/70"
                  colSpan={isSyndic ? '6' : '5'}
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

export default JournalDepenses
