import { useState } from 'react'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useCotisations from '../hooks/useCotisations'
import useResidents from '../hooks/useResidents'
import useSyndicMode from '../hooks/useSyndicMode'
import {
  getCotisationDocId,
  getCotisationStatus,
  getCurrentCotisationYear,
} from '../utils/finance'

const months = [
  { id: 1, label: 'Jan' },
  { id: 2, label: 'Fév' },
  { id: 3, label: 'Mar' },
  { id: 4, label: 'Avr' },
  { id: 5, label: 'Mai' },
  { id: 6, label: 'Juin' },
  { id: 7, label: 'Juil' },
  { id: 8, label: 'Août' },
  { id: 9, label: 'Sep' },
  { id: 10, label: 'Oct' },
  { id: 11, label: 'Nov' },
  { id: 12, label: 'Déc' },
]

const statusStyles = {
  paye: 'bg-emerald-500 ring-emerald-100',
  impaye: 'bg-red-500 ring-red-100',
  futur: 'bg-slate-200 ring-slate-100',
}

const statusLabels = {
  paye: 'payée',
  impaye: 'impayée',
  futur: 'future',
}

const anneeCotisations = getCurrentCotisationYear()

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
  } = useCotisations(anneeCotisations)
  const [writeError, setWriteError] = useState(null)
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null)

  const togglePaymentStatus = async (residentId, monthId) => {
    if (!syndicMode) {
      return
    }

    const currentStatus = getCotisationStatus(
      cotisations,
      residentId,
      monthId,
      anneeCotisations,
    )

    if (currentStatus === 'futur') {
      return
    }

    const nextStatus = currentStatus === 'paye' ? 'impaye' : 'paye'
    const residentIdAsString = String(residentId)
    const paymentDocumentId = getCotisationDocId(
      residentIdAsString,
      anneeCotisations,
      monthId,
    )

    setUpdatingPaymentId(paymentDocumentId)
    setWriteError(null)

    try {
      await setDoc(
        doc(db, 'cotisations', paymentDocumentId),
        {
          residentId: residentIdAsString,
          mois: monthId,
          annee: anneeCotisations,
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

  return (
    <section className="w-full">
      <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            Cotisations {anneeCotisations}
          </p>
          <h2 className="mt-2 text-2xl font-bold text-indigo-950">
            Suivi mensuel des paiements
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Activez le mode Syndic pour modifier les statuts payés ou impayés.
          </p>
        </div>

        <div className="rounded-full bg-indigo-50 px-4 py-3 text-sm font-semibold text-indigo-950">
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
        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left text-sm">
              <thead className="bg-indigo-950 text-white">
                <tr>
                  <th className="min-w-56 px-5 py-4 font-semibold">Appartement</th>
                  {months.map((month) => (
                    <th
                      className="px-4 py-4 text-center font-semibold"
                      key={month.id}
                    >
                      {month.label}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {residents.map((resident) => (
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
                        month.id,
                        anneeCotisations,
                      )
                      const isInteractive = syndicMode && status !== 'futur'
                      const paymentDocumentId = getCotisationDocId(
                        resident.id,
                        anneeCotisations,
                        month.id,
                      )
                      const isUpdating = updatingPaymentId === paymentDocumentId

                      return (
                        <td className="px-4 py-4 text-center" key={month.id}>
                          <button
                            aria-label={`${resident.nom}, ${month.label} : cotisation ${statusLabels[status]}`}
                            className={`inline-flex h-5 w-5 rounded-full ring-4 transition ${statusStyles[status]} ${
                              isInteractive && !isUpdating
                                ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-indigo-200'
                                : 'cursor-default opacity-80'
                            }`}
                            disabled={!isInteractive || isUpdating}
                            onClick={() =>
                              togglePaymentStatus(resident.id, month.id)
                            }
                            type="button"
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      <div className="mt-5 flex flex-wrap gap-4 text-sm text-slate-600">
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-emerald-500" />
          Payé
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-red-500" />
          Impayé
        </span>
        <span className="flex items-center gap-2">
          <span className="h-3 w-3 rounded-full bg-slate-200" />
          Futur
        </span>
      </div>
    </section>
  )
}

export default TableauCotisations
