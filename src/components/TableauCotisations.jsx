import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useCotisations from '../hooks/useCotisations'
import useResidents from '../hooks/useResidents'
import useSyndicMode from '../hooks/useSyndicMode'
import ResumeCotisations from './ResumeCotisations'
import {
  DEVISE,
  getCotisationDocId,
  getCotisationPeriodMonths,
  getCotisationStatus,
  MONTANT_COTISATION,
} from '../utils/finance'

const months = getCotisationPeriodMonths()

const statusStyles = {
  paye: 'bg-[#22C55E] text-white ring-[#BBF7D0]',
  impaye: 'bg-[#DC2626] text-white ring-red-100',
  futur: 'bg-[#D1D5DB] text-transparent ring-slate-100',
}

const statusLabels = {
  paye: 'payée',
  impaye: 'impayée',
  futur: 'future',
}

const statusSymbols = {
  paye: '✓',
  impaye: '✗',
  futur: '',
}

const initialResidentFormValues = {
  nom: '',
  telephone: '',
  email: '',
}

function TableauCotisations() {
  const { isSyndic } = useSyndicMode()
  const {
    residents,
    loading: residentsLoading,
    error: residentsError,
  } = useResidents()
  const {
    cotisations,
    loading: cotisationsLoading,
    error: cotisationsError,
  } = useCotisations()
  const [writeError, setWriteError] = useState(null)
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null)
  const [selectedResident, setSelectedResident] = useState(null)
  const [residentFormValues, setResidentFormValues] = useState(
    initialResidentFormValues,
  )
  const [residentFeedback, setResidentFeedback] = useState(null)
  const [residentSaving, setResidentSaving] = useState(false)

  const togglePaymentStatus = async (residentId, month) => {
    if (!isSyndic) {
      return
    }

    const currentStatus = getCotisationStatus(
      cotisations,
      residentId,
      month.mois,
      month.annee,
    )

    if (currentStatus === 'futur') {
      return
    }

    const nextStatus = currentStatus === 'paye' ? 'impaye' : 'paye'
    const residentIdAsString = String(residentId)
    const paymentDocumentId = getCotisationDocId(
      residentIdAsString,
      month.annee,
      month.mois,
    )

    setUpdatingPaymentId(paymentDocumentId)
    setWriteError(null)

    try {
      await setDoc(
        doc(db, 'cotisations', paymentDocumentId),
        {
          residentId: residentIdAsString,
          mois: month.mois,
          annee: month.annee,
          statut: nextStatus,
        },
        { merge: true },
      )
    } catch (paymentError) {
      setWriteError(paymentError)
    } finally {
      setUpdatingPaymentId(null)
    }
  }

  const openResidentHistory = (resident) => {
    setSelectedResident(resident)
    setResidentFormValues({
      nom: resident.nom ?? '',
      telephone: resident.telephone ?? '',
      email: resident.email ?? '',
    })
    setResidentFeedback(null)
  }

  const closeResidentHistory = () => {
    setSelectedResident(null)
    setResidentFormValues(initialResidentFormValues)
    setResidentFeedback(null)
  }

  const updateResidentField = (field, value) => {
    setResidentFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setResidentFeedback(null)
  }

  const handleResidentSubmit = async (event) => {
    event.preventDefault()

    if (!selectedResident) {
      return
    }

    const updatedResident = {
      nom: residentFormValues.nom.trim(),
      telephone: residentFormValues.telephone.trim(),
      email: residentFormValues.email.trim(),
    }

    setResidentSaving(true)
    setResidentFeedback(null)

    try {
      await setDoc(
        doc(db, 'residents', String(selectedResident.id)),
        updatedResident,
        { merge: true },
      )
      setSelectedResident((currentResident) => ({
        ...currentResident,
        ...updatedResident,
      }))
      setResidentFeedback({
        type: 'success',
        message: 'Coordonnées du résident mises à jour.',
      })
    } catch (residentError) {
      setResidentFeedback({
        type: 'error',
        message: `Impossible de mettre à jour le résident : ${residentError.message}`,
      })
    } finally {
      setResidentSaving(false)
    }
  }

  const loading = residentsLoading || cotisationsLoading
  const error = residentsError ?? cotisationsError
  const getPaidCountForResident = (residentId) =>
    months.filter(
      (month) =>
        getCotisationStatus(
          cotisations,
          residentId,
          month.mois,
          month.annee,
        ) === 'paye',
    ).length
  const getPaidCountForMonth = (month) =>
    residents.filter(
      (resident) =>
        getCotisationStatus(
          cotisations,
          resident.id,
          month.mois,
          month.annee,
        ) === 'paye',
    ).length
  const selectedPaidCount = selectedResident
    ? getPaidCountForResident(selectedResident.id)
    : 0
  const selectedUnpaidMonths = selectedResident
    ? months.filter(
        (month) =>
          getCotisationStatus(
            cotisations,
            selectedResident.id,
            month.mois,
            month.annee,
          ) === 'impaye',
      )
    : []
  const selectedRegularityRate = Math.round(
    (selectedPaidCount / months.length) * 100,
  )

  return (
    <section className="w-full">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#059669]/20 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
            Cotisations Mai 2026 - Avril 2027
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#064E3B]">
            Suivi mensuel des paiements
          </h2>
          <p className="mt-2 text-sm text-[#064E3B]/70">
            Cotisation mensuelle : {MONTANT_COTISATION} {DEVISE}.
          </p>
        </div>

      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
          Impossible de charger les cotisations : {error.message}
        </div>
      ) : null}

      {writeError ? (
        <div className="mt-4 rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
          Impossible de mettre à jour la cotisation : {writeError.message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#A7F3D0] bg-white p-6 text-sm text-[#064E3B]/70 shadow-sm">
          Chargement des résidents...
        </div>
      ) : null}

      {!loading && !error && residents.length === 0 ? (
        <div className="rounded-2xl border border-[#A7F3D0] bg-white p-6 text-sm text-[#064E3B]/70 shadow-sm">
          Aucun résident trouvé dans Firestore.
        </div>
      ) : null}

      {!loading && !error && residents.length > 0 ? (
        <>
          <ResumeCotisations cotisations={cotisations} residents={residents} />

          <div className="overflow-hidden rounded-2xl border border-[#A7F3D0] bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-[#059669] text-white">
                  <tr>
                    <th className="min-w-44 px-3 py-3 font-semibold md:min-w-56 md:px-5 md:py-4">Appartement</th>
                    {months.map((month) => (
                      <th
                        className="px-2 py-3 text-center font-semibold md:px-4 md:py-4"
                        key={month.key}
                      >
                        {month.label}
                      </th>
                    ))}
                    <th className="min-w-32 bg-[#059669] px-3 py-3 text-center font-semibold text-white md:min-w-40 md:px-5 md:py-4">
                      Total payé
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-[#A7F3D0]/50">
                  {residents.map((resident) => {
                    const paidCount = getPaidCountForResident(resident.id)

                    return (
                      <tr className="odd:bg-white odd:dark:bg-[#0d4a42] even:bg-[#F0FDF4] even:dark:bg-[#083832] hover:bg-[#A7F3D0]/25 dark:hover:bg-[#14b8a6]/20" key={resident.id}>
                        <th className="px-3 py-3 text-left font-medium text-[#064E3B] dark:text-[#f0fdf4] md:px-5 md:py-4">
                          <button
                            className="w-full rounded-xl text-left transition hover:text-[#059669] dark:text-[#f0fdf4] dark:hover:text-[#6ee7b7] focus:outline-none focus:ring-4 focus:ring-[#059669]/20"
                            onClick={() => openResidentHistory(resident)}
                            type="button"
                          >
                            <span className="block font-medium">{resident.appartement}</span>
                            <span className="mt-1 block text-[11px] font-normal text-[#064E3B]/70 dark:text-[#a7f3d0] md:text-xs">
                              {resident.nom}
                            </span>
                          </button>
                        </th>

                        {months.map((month) => {
                          const status = getCotisationStatus(
                            cotisations,
                            resident.id,
                            month.mois,
                            month.annee,
                          )
                          const isInteractive = isSyndic && status !== 'futur'
                          const paymentDocumentId = getCotisationDocId(
                            resident.id,
                            month.annee,
                            month.mois,
                          )
                          const isUpdating = updatingPaymentId === paymentDocumentId

                          return (
                            <td className="px-2 py-3 text-center md:px-4 md:py-4" key={month.key}>
                              <button
                                aria-label={`${resident.nom}, ${month.label} : cotisation ${statusLabels[status]}`}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ring-4 transition ${statusStyles[status]} ${
                                  isInteractive && !isUpdating
                                    ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-[#059669]/30'
                                    : 'cursor-default opacity-80'
                                }`}
                                disabled={!isInteractive || isUpdating}
                                onClick={() =>
                                  togglePaymentStatus(resident.id, month)
                                }
                                type="button"
                              >
                                {statusSymbols[status]}
                              </button>
                            </td>
                          )
                        })}

                        <td className="bg-[#F0FDF4] px-3 py-3 text-center text-xs font-semibold text-[#064E3B] dark:bg-[#083832] dark:text-[#f0fdf4] md:px-5 md:py-4 md:text-sm">
                          {paidCount} mois - {paidCount * MONTANT_COTISATION}{' '}
                          {DEVISE}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>

                <tfoot>
                  <tr className="border-t border-[#A7F3D0] bg-[#F0FDF4]">
                    <th className="px-3 py-3 text-left font-bold text-[#064E3B] dark:text-[#f0fdf4] md:px-5 md:py-4">
                      Total perçu
                    </th>
                    {months.map((month) => {
                      const paidCount = getPaidCountForMonth(month)

                      return (
                        <td
                          className="px-2 py-3 text-center text-xs font-semibold text-[#064E3B] dark:text-[#f0fdf4] md:px-4 md:py-4 md:text-sm"
                          key={month.key}
                        >
                          {paidCount * MONTANT_COTISATION}
                        </td>
                      )
                    })}
                    <td className="bg-[#A7F3D0] px-3 py-3 text-center text-xs font-bold text-[#064E3B] dark:bg-[#115e59] dark:text-[#f0fdf4] md:px-5 md:py-4 md:text-sm">
                      {months.reduce(
                        (total, month) => total + getPaidCountForMonth(month),
                        0,
                      ) * MONTANT_COTISATION}{' '}
                      {DEVISE}
                    </td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </>
      ) : null}

      <details className="mt-5 w-fit rounded-2xl border border-[#A7F3D0] bg-white px-4 py-3 text-sm text-[#064E3B]/75 shadow-sm">
        <summary className="cursor-pointer font-semibold text-[#064E3B]">
          Légende
        </summary>
        <div className="mt-3 flex flex-wrap gap-4">
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-[#22C55E]" />
            Payé
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-[#DC2626]" />
            Impayé
          </span>
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-full bg-[#D1D5DB]" />
            Futur
          </span>
        </div>
      </details>

      {selectedResident ? (
        <div
          aria-labelledby="resident-history-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8"
          onClick={closeResidentHistory}
          role="dialog"
        >
          <div
            className="w-full max-w-4xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-[#A7F3D0]/50 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
                  Historique résident
                </p>
                <h2
                  className="mt-2 text-2xl font-bold text-[#064E3B]"
                  id="resident-history-title"
                >
                  {selectedResident.nom} - {selectedResident.appartement}
                </h2>
                <p className="mt-2 text-sm text-[#064E3B]/70">
                  Détail des cotisations de Mai 2026 à Avril 2027.
                </p>
              </div>

              <button
                className="rounded-full bg-[#ECFDF5] px-4 py-2 text-sm font-semibold text-[#064E3B]/80 transition hover:bg-[#D1D5DB]"
                onClick={closeResidentHistory}
                type="button"
              >
                Fermer
              </button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-3">
              <article className="rounded-xl bg-[#059669]/10 p-4">
                <p className="text-sm font-medium text-[#047857]">Total payé</p>
                <p className="mt-2 text-2xl font-bold text-[#064E3B]">
                  {selectedPaidCount} mois sur {months.length}
                </p>
                <p className="mt-1 text-sm text-[#064E3B]/75">
                  = {selectedPaidCount * MONTANT_COTISATION} {DEVISE}
                </p>
              </article>

              <article className="rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-medium text-emerald-700">
                  Taux de régularité
                </p>
                <p className="mt-2 text-2xl font-bold text-emerald-900">
                  {selectedRegularityRate}%
                </p>
              </article>

              <article className="rounded-xl bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">Mois impayés</p>
                {selectedUnpaidMonths.length > 0 ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {selectedUnpaidMonths.map((month) => (
                      <span
                        className="rounded-full bg-white px-3 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-100"
                        key={month.key}
                      >
                        {month.label}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="mt-2 text-sm font-medium text-red-700">
                    Aucun mois impayé.
                  </p>
                )}
              </article>
            </div>

            {isSyndic ? (
              <form
                className="mt-6 rounded-2xl border border-[#059669]/20 bg-[#F0FDF4] p-5"
                onSubmit={handleResidentSubmit}
              >
                <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
                  <div>
                    <p className="text-sm font-semibold uppercase tracking-[0.16em] text-[#059669]">
                      Édition syndic
                    </p>
                    <h3 className="mt-1 text-lg font-bold text-[#064E3B]">
                      Modifier les coordonnées
                    </h3>
                  </div>
                  <button
                    className="rounded-xl bg-[#059669] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#047857] focus:outline-none focus:ring-4 focus:ring-[#059669]/30 disabled:cursor-not-allowed disabled:opacity-70"
                    disabled={residentSaving}
                    type="submit"
                  >
                    {residentSaving ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                </div>

                <div className="mt-5 grid gap-4 md:grid-cols-3">
                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                      htmlFor="resident-nom"
                    >
                      Nom
                    </label>
                    <input
                      className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                      id="resident-nom"
                      onChange={(event) =>
                        updateResidentField('nom', event.target.value)
                      }
                      required
                      type="text"
                      value={residentFormValues.nom}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                      htmlFor="resident-telephone"
                    >
                      Téléphone
                    </label>
                    <input
                      className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                      id="resident-telephone"
                      onChange={(event) =>
                        updateResidentField('telephone', event.target.value)
                      }
                      type="tel"
                      value={residentFormValues.telephone}
                    />
                  </div>

                  <div>
                    <label
                      className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                      htmlFor="resident-email"
                    >
                      Email
                    </label>
                    <input
                      className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                      id="resident-email"
                      onChange={(event) =>
                        updateResidentField('email', event.target.value)
                      }
                      type="email"
                      value={residentFormValues.email}
                    />
                  </div>
                </div>

                {residentFeedback ? (
                  <p
                    className={`mt-4 rounded-xl border p-4 text-sm font-medium ${
                      residentFeedback.type === 'success'
                        ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                        : 'border-red-100 bg-red-50 text-red-700'
                    }`}
                  >
                    {residentFeedback.message}
                  </p>
                ) : null}
              </form>
            ) : null}

            <div className="mt-6 overflow-hidden rounded-2xl border border-[#A7F3D0]">
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse text-left text-sm">
                  <thead className="bg-[#F0FDF4] text-[#064E3B]/75">
                    <tr>
                      <th className="px-5 py-4 font-semibold">Mois</th>
                      <th className="px-5 py-4 text-center font-semibold">
                        Statut
                      </th>
                      <th className="px-5 py-4 font-semibold">Détail</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#A7F3D0]/50">
                    {months.map((month) => {
                      const status = getCotisationStatus(
                        cotisations,
                        selectedResident.id,
                        month.mois,
                        month.annee,
                      )
                      const isInteractive = isSyndic && status !== 'futur'
                      const paymentDocumentId = getCotisationDocId(
                        selectedResident.id,
                        month.annee,
                        month.mois,
                      )
                      const isUpdating = updatingPaymentId === paymentDocumentId

                      return (
                        <tr
                          className={status === 'impaye' ? 'bg-red-50/60' : ''}
                          key={month.key}
                        >
                          <td className="whitespace-nowrap px-5 py-4 font-medium text-[#064E3B]">
                            {month.label}
                          </td>
                          <td className="px-5 py-4 text-center">
                            <button
                              aria-label={`${selectedResident.nom}, ${month.label} : cotisation ${statusLabels[status]}`}
                              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ring-4 transition ${statusStyles[status]} ${
                                isInteractive && !isUpdating
                                  ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-[#059669]/30'
                                  : 'cursor-default opacity-80'
                              }`}
                              disabled={!isInteractive || isUpdating}
                              onClick={() =>
                                togglePaymentStatus(selectedResident.id, month)
                              }
                              type="button"
                            >
                              {statusSymbols[status]}
                            </button>
                          </td>
                          <td className="px-5 py-4 capitalize text-[#064E3B]/75">
                            {statusLabels[status]}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default TableauCotisations
