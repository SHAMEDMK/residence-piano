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
  paye: 'bg-emerald-500 text-white ring-emerald-100',
  impaye: 'bg-red-500 text-white ring-red-100',
  futur: 'bg-slate-200 text-transparent ring-slate-100',
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

function TableauCotisations() {
  const { syndicMode } = useSyndicMode()
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

  const togglePaymentStatus = async (residentId, month) => {
    if (!syndicMode) {
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

  return (
    <section className="w-full">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-[#aa3bff]/20 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#aa3bff]">
            Cotisations Mai 2026 - Avril 2027
          </p>
          <h2 className="mt-2 text-2xl font-bold text-slate-950">
            Suivi mensuel des paiements
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Cotisation mensuelle : {MONTANT_COTISATION} {DEVISE}. Activez le
            mode Syndic pour modifier les statuts payés ou impayés.
          </p>
        </div>

        <div className="rounded-full bg-[#aa3bff]/10 px-4 py-3 text-sm font-semibold text-[#2e0f44]">
          Mode Syndic {syndicMode ? 'activé' : 'désactivé'}
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
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Chargement des résidents...
        </div>
      ) : null}

      {!loading && !error && residents.length === 0 ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
          Aucun résident trouvé dans Firestore.
        </div>
      ) : null}

      {!loading && !error && residents.length > 0 ? (
        <>
          <ResumeCotisations cotisations={cotisations} residents={residents} />

          <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse text-left text-sm">
                <thead className="bg-[#2e0f44] text-white">
                  <tr>
                    <th className="min-w-56 px-5 py-4 font-semibold">Appartement</th>
                    {months.map((month) => (
                      <th
                        className="px-4 py-4 text-center font-semibold"
                        key={month.key}
                      >
                        {month.label}
                      </th>
                    ))}
                    <th className="min-w-40 bg-slate-100 px-5 py-4 text-center font-semibold text-[#2e0f44]">
                      Total payé
                    </th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {residents.map((resident) => {
                    const paidCount = getPaidCountForResident(resident.id)

                    return (
                      <tr className="hover:bg-slate-50" key={resident.id}>
                        <th className="px-5 py-4 font-medium text-slate-900">
                          <span className="block">{resident.appartement}</span>
                          <span className="mt-1 block text-xs font-normal text-slate-500">
                            {resident.nom}
                          </span>
                        </th>

                        {months.map((month) => {
                          const status = getCotisationStatus(
                            cotisations,
                            resident.id,
                            month.mois,
                            month.annee,
                          )
                          const isInteractive = syndicMode && status !== 'futur'
                          const paymentDocumentId = getCotisationDocId(
                            resident.id,
                            month.annee,
                            month.mois,
                          )
                          const isUpdating = updatingPaymentId === paymentDocumentId

                          return (
                            <td className="px-4 py-4 text-center" key={month.key}>
                              <button
                                aria-label={`${resident.nom}, ${month.label} : cotisation ${statusLabels[status]}`}
                                className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-lg font-bold ring-4 transition ${statusStyles[status]} ${
                                  isInteractive && !isUpdating
                                    ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-[#aa3bff]/30'
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

                        <td className="bg-slate-50 px-5 py-4 text-center font-semibold text-slate-900">
                          {paidCount} mois - {paidCount * MONTANT_COTISATION}{' '}
                          {DEVISE}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>

                <tfoot>
                  <tr className="border-t border-slate-200 bg-slate-50">
                    <th className="px-5 py-4 text-left font-bold text-slate-900">
                      Total perçu
                    </th>
                    {months.map((month) => {
                      const paidCount = getPaidCountForMonth(month)

                      return (
                        <td
                          className="px-4 py-4 text-center text-sm font-semibold text-slate-900"
                          key={month.key}
                        >
                          {paidCount * MONTANT_COTISATION}
                        </td>
                      )
                    })}
                    <td className="bg-slate-100 px-5 py-4 text-center font-bold text-[#2e0f44]">
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

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full bg-emerald-500" />
          Payé
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full bg-red-500" />
          Impayé
        </span>
        <span className="flex items-center gap-2">
          <span className="h-4 w-4 rounded-full bg-slate-200" />
          Futur
        </span>
      </div>
    </section>
  )
}

export default TableauCotisations
