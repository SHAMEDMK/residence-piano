import { useState } from 'react'
import { addDoc, collection, doc, serverTimestamp, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useResidents from '../hooks/useResidents'
import useSyndicMode from '../hooks/useSyndicMode'
import { formatMontant } from '../utils/finance'

const initialFormValues = {
  titre: '',
  description: '',
  montant: '',
  echeance: '',
}

const statusStyles = {
  paye: 'bg-[#22C55E] text-white ring-[#BBF7D0]',
  impaye: 'bg-[#DC2626] text-white ring-red-100',
}

const statusSymbols = {
  paye: '✓',
  impaye: '✗',
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

function formatDate(dateValue) {
  if (!dateValue) {
    return 'Non définie'
  }

  return dateFormatter.format(new Date(`${dateValue}T00:00:00`))
}

function getResidentStatus(cotisationExceptionnelle, residentId) {
  return cotisationExceptionnelle.statuts?.[String(residentId)] === 'paye'
    ? 'paye'
    : 'impaye'
}

function getPaidCount(cotisationExceptionnelle, residents) {
  return residents.filter(
    (resident) => getResidentStatus(cotisationExceptionnelle, resident.id) === 'paye',
  ).length
}

function CotisationsExceptionnelles({
  cotisationsExceptionnelles,
  cotisationsExceptionnellesError,
  cotisationsExceptionnellesLoading,
}) {
  const { isSyndic } = useSyndicMode()
  const {
    residents,
    loading: residentsLoading,
    error: residentsError,
  } = useResidents()
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [formValues, setFormValues] = useState(initialFormValues)
  const [selectedCotisationId, setSelectedCotisationId] = useState(null)
  const [saving, setSaving] = useState(false)
  const [updatingPaymentId, setUpdatingPaymentId] = useState(null)
  const [error, setError] = useState(null)
  const selectedCotisation =
    cotisationsExceptionnelles.find(
      (cotisationExceptionnelle) =>
        cotisationExceptionnelle.id === selectedCotisationId,
    ) ?? null
  const loading = cotisationsExceptionnellesLoading || residentsLoading
  const loadError = cotisationsExceptionnellesError ?? residentsError

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setError(null)
  }

  const resetForm = () => {
    setFormValues(initialFormValues)
    setIsFormOpen(false)
    setError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const montant = Number(formValues.montant)

    if (Number.isNaN(montant) || montant <= 0) {
      setError(new Error('Le montant doit être supérieur à 0.'))
      return
    }

    setSaving(true)
    setError(null)

    const statuts = residents.reduce(
      (nextStatuts, resident) => ({
        ...nextStatuts,
        [String(resident.id)]: 'impaye',
      }),
      {},
    )

    try {
      await addDoc(collection(db, 'cotisationsExceptionnelles'), {
        titre: formValues.titre.trim(),
        description: formValues.description.trim(),
        montant,
        dateCreation: serverTimestamp(),
        echeance: formValues.echeance,
        statuts,
      })

      resetForm()
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSaving(false)
    }
  }

  const togglePaymentStatus = async (cotisationExceptionnelle, residentId) => {
    if (!isSyndic) {
      return
    }

    const currentStatus = getResidentStatus(cotisationExceptionnelle, residentId)
    const nextStatus = currentStatus === 'paye' ? 'impaye' : 'paye'
    const paymentId = `${cotisationExceptionnelle.id}_${residentId}`

    setUpdatingPaymentId(paymentId)
    setError(null)

    try {
      await updateDoc(
        doc(db, 'cotisationsExceptionnelles', cotisationExceptionnelle.id),
        {
          [`statuts.${residentId}`]: nextStatus,
        },
      )
    } catch (updateError) {
      setError(updateError)
    } finally {
      setUpdatingPaymentId(null)
    }
  }

  return (
    <section className="w-full space-y-8">
      <div className="flex flex-col gap-4 rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
            Cotisations exceptionnelles
          </p>
          <h2 className="mt-2 text-2xl font-bold text-[#064E3B]">
            Suivi des appels ponctuels
          </h2>
          <p className="mt-2 text-sm text-[#064E3B]/70">
            Gérez les paiements exceptionnels par appartement en temps réel.
          </p>
        </div>

        {isSyndic ? (
          <button
            className="rounded-xl bg-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#047857] focus:outline-none focus:ring-4 focus:ring-[#059669]/30"
            onClick={() => setIsFormOpen((currentIsOpen) => !currentIsOpen)}
            type="button"
          >
            {isFormOpen
              ? 'Masquer le formulaire'
              : 'Nouvelle cotisation exceptionnelle'}
          </button>
        ) : null}
      </div>

      {isSyndic && isFormOpen ? (
        <form
          className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm"
          onSubmit={handleSubmit}
        >
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
              Nouvelle cotisation
            </p>
            <h3 className="mt-2 text-xl font-bold text-[#064E3B]">
              Créer un appel exceptionnel
            </h3>
          </div>

          {error ? (
            <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
              Impossible de traiter la cotisation : {error.message}
            </div>
          ) : null}

          <div className="mt-6 grid gap-5 md:grid-cols-2">
            <div>
              <label
                className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                htmlFor="cotisation-exceptionnelle-titre"
              >
                Titre
              </label>
              <input
                className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                id="cotisation-exceptionnelle-titre"
                onChange={(event) => updateField('titre', event.target.value)}
                required
                type="text"
                value={formValues.titre}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                htmlFor="cotisation-exceptionnelle-echeance"
              >
                Date d'échéance
              </label>
              <input
                className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                id="cotisation-exceptionnelle-echeance"
                onChange={(event) => updateField('echeance', event.target.value)}
                required
                type="date"
                value={formValues.echeance}
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                htmlFor="cotisation-exceptionnelle-montant"
              >
                Montant par appartement
              </label>
              <div className="flex overflow-hidden rounded-xl border border-[#A7F3D0] transition focus-within:border-[#059669] focus-within:ring-4 focus-within:ring-[#059669]/20">
                <input
                  className="w-full px-4 py-3 text-sm outline-none"
                  id="cotisation-exceptionnelle-montant"
                  min="1"
                  onChange={(event) => updateField('montant', event.target.value)}
                  required
                  type="number"
                  value={formValues.montant}
                />
                <span className="flex items-center bg-[#F0FDF4] px-4 text-sm font-semibold text-[#064E3B]/70">
                  DH
                </span>
              </div>
            </div>

            <div className="md:row-span-2">
              <label
                className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                htmlFor="cotisation-exceptionnelle-description"
              >
                Description
              </label>
              <textarea
                className="min-h-32 w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                id="cotisation-exceptionnelle-description"
                onChange={(event) => updateField('description', event.target.value)}
                required
                value={formValues.description}
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
            <button
              className="rounded-xl bg-[#ECFDF5] px-5 py-3 text-sm font-semibold text-[#064E3B]/75 transition hover:bg-[#D1D5DB]"
              onClick={resetForm}
              type="button"
            >
              Annuler
            </button>
            <button
              className="rounded-xl bg-[#059669] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#047857] focus:outline-none focus:ring-4 focus:ring-[#059669]/30 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={saving || residents.length === 0}
              type="submit"
            >
              {saving ? 'Création...' : 'Créer la cotisation'}
            </button>
          </div>
        </form>
      ) : null}

      {loadError ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
          Impossible de charger les cotisations exceptionnelles : {loadError.message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#A7F3D0] bg-white p-6 text-sm text-[#064E3B]/70 shadow-sm">
          Chargement des cotisations exceptionnelles...
        </div>
      ) : null}

      {!loading && !loadError ? (
        <div className="grid gap-6 lg:grid-cols-2">
          {cotisationsExceptionnelles.length > 0 ? (
            cotisationsExceptionnelles.map((cotisationExceptionnelle) => {
              const paidCount = getPaidCount(cotisationExceptionnelle, residents)
              const totalResidents = residents.length || 9
              const progress = Math.round((paidCount / totalResidents) * 100)

              return (
                <article
                  className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm"
                  key={cotisationExceptionnelle.id}
                >
                  <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                    <div>
                      <p className="text-sm font-semibold text-[#059669]">
                        Échéance : {formatDate(cotisationExceptionnelle.echeance)}
                      </p>
                      <h3 className="mt-2 text-xl font-bold text-[#064E3B]">
                        {cotisationExceptionnelle.titre}
                      </h3>
                    </div>
                    <p className="rounded-full bg-[#ECFDF5] px-4 py-2 text-sm font-bold text-[#064E3B]">
                      {formatMontant(cotisationExceptionnelle.montant)}
                    </p>
                  </div>

                  <p className="mt-4 leading-7 text-[#064E3B]/75">
                    {cotisationExceptionnelle.description}
                  </p>

                  <div className="mt-5">
                    <div className="flex items-center justify-between gap-4 text-sm font-semibold text-[#064E3B]">
                      <span>
                        {paidCount}/{totalResidents} payé
                      </span>
                      <span>{progress}%</span>
                    </div>
                    <div className="mt-2 h-3 overflow-hidden rounded-full bg-[#ECFDF5]">
                      <div
                        className="h-full rounded-full bg-[#22C55E] transition-all"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>

                  <button
                    className="mt-6 w-full rounded-xl bg-[#059669] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#047857] focus:outline-none focus:ring-4 focus:ring-[#059669]/30"
                    onClick={() => setSelectedCotisationId(cotisationExceptionnelle.id)}
                    type="button"
                  >
                    Voir détails
                  </button>
                </article>
              )
            })
          ) : (
            <div className="rounded-2xl border border-[#A7F3D0] bg-white p-6 text-sm text-[#064E3B]/70 shadow-sm">
              Aucune cotisation exceptionnelle enregistrée.
            </div>
          )}
        </div>
      ) : null}

      {selectedCotisation ? (
        <div
          aria-labelledby="cotisation-exceptionnelle-detail-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 px-4 py-8"
          onClick={() => setSelectedCotisationId(null)}
          role="dialog"
        >
          <div
            className="w-full max-w-3xl rounded-2xl bg-white p-6 shadow-xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex flex-col gap-4 border-b border-[#A7F3D0]/50 pb-5 md:flex-row md:items-start md:justify-between">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
                  Suivi des paiements
                </p>
                <h2
                  className="mt-2 text-2xl font-bold text-[#064E3B]"
                  id="cotisation-exceptionnelle-detail-title"
                >
                  {selectedCotisation.titre}
                </h2>
                <p className="mt-2 text-sm font-semibold text-[#064E3B]/75">
                  Montant : {formatMontant(selectedCotisation.montant)}
                </p>
              </div>

              <button
                className="rounded-full bg-[#ECFDF5] px-4 py-2 text-sm font-semibold text-[#064E3B]/80 transition hover:bg-[#D1D5DB]"
                onClick={() => setSelectedCotisationId(null)}
                type="button"
              >
                Fermer
              </button>
            </div>

            {error ? (
              <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
                Impossible de mettre à jour le paiement : {error.message}
              </div>
            ) : null}

            <div className="mt-6 divide-y divide-[#A7F3D0]/50 rounded-2xl border border-[#A7F3D0]">
              {residents.map((resident) => {
                const status = getResidentStatus(selectedCotisation, resident.id)
                const paymentId = `${selectedCotisation.id}_${resident.id}`
                const isUpdating = updatingPaymentId === paymentId

                return (
                  <div
                    className="flex items-center justify-between gap-4 p-4"
                    key={resident.id}
                  >
                    <div>
                      <p className="font-semibold text-[#064E3B]">
                        {resident.appartement}
                      </p>
                      <p className="mt-1 text-sm text-[#064E3B]/70">
                        {resident.nom}
                      </p>
                    </div>
                    <button
                      aria-label={`${resident.appartement} : cotisation exceptionnelle ${
                        status === 'paye' ? 'payée' : 'impayée'
                      }`}
                      className={`inline-flex h-9 w-9 items-center justify-center rounded-full text-lg font-bold ring-4 transition ${statusStyles[status]} ${
                        isSyndic && !isUpdating
                          ? 'cursor-pointer hover:scale-110 focus:outline-none focus:ring-[#059669]/30'
                          : 'cursor-default opacity-80'
                      }`}
                      disabled={!isSyndic || isUpdating}
                      onClick={() =>
                        togglePaymentStatus(selectedCotisation, String(resident.id))
                      }
                      type="button"
                    >
                      {statusSymbols[status]}
                    </button>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 rounded-2xl bg-[#F0FDF4] p-5 text-center">
              <p className="text-lg font-bold text-[#064E3B]">
                {getPaidCount(selectedCotisation, residents)}/{residents.length || 9}{' '}
                payé - Total perçu :{' '}
                {formatMontant(
                  getPaidCount(selectedCotisation, residents) *
                    selectedCotisation.montant,
                )}
              </p>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}

export default CotisationsExceptionnelles
