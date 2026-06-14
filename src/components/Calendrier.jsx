import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, deleteDoc, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import useSyndicMode from '../hooks/useSyndicMode'
import { TYPES_INTERVENTIONS } from '../utils/finance'

const initialFormValues = {
  titre: '',
  date: '',
  description: '',
  type: TYPES_INTERVENTIONS[0],
}

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const typeBadgeStyles = {
  'Entretien ascenseur': 'bg-orange-50 text-orange-700 ring-orange-100',
  Ménage: 'bg-blue-50 text-blue-700 ring-blue-100',
  Réparation: 'bg-red-50 text-red-700 ring-red-100',
  Autre: 'bg-[#ECFDF5] text-[#064E3B]/75 ring-slate-200',
}

function isPastIntervention(interventionDate) {
  const today = new Date().toISOString().slice(0, 10)

  return interventionDate < today
}

function Calendrier({ interventions, interventionsError, interventionsLoading }) {
  const { isSyndic } = useSyndicMode()
  const [formValues, setFormValues] = useState(initialFormValues)
  const [editingIntervention, setEditingIntervention] = useState(null)
  const [pendingDeleteInterventionId, setPendingDeleteInterventionId] =
    useState(null)
  const [saving, setSaving] = useState(false)
  const [deletingInterventionId, setDeletingInterventionId] = useState(null)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState('')
  const successTimerRef = useRef(null)

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

  const resetForm = () => {
    setFormValues(initialFormValues)
    setEditingIntervention(null)
    setError(null)
  }

  const startEditing = (intervention) => {
    setEditingIntervention(intervention)
    setFormValues({
      titre: intervention.titre,
      date: intervention.date,
      description: intervention.description,
      type: intervention.type,
    })
    setError(null)
    setSuccessMessage('')
  }

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setError(null)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setError(null)

    const interventionData = {
      titre: formValues.titre.trim(),
      date: formValues.date,
      description: formValues.description.trim(),
      type: formValues.type,
    }

    try {
      if (editingIntervention) {
        await updateDoc(
          doc(db, 'interventions', editingIntervention.id),
          interventionData,
        )
        showSuccessMessage('Intervention modifiée avec succès.')
      } else {
        await addDoc(collection(db, 'interventions'), interventionData)
        showSuccessMessage('Intervention ajoutée avec succès.')
      }

      resetForm()
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSaving(false)
    }
  }

  const confirmDelete = async (interventionId) => {
    setDeletingInterventionId(interventionId)
    setError(null)

    try {
      await deleteDoc(doc(db, 'interventions', interventionId))
      setPendingDeleteInterventionId(null)
      showSuccessMessage('Intervention supprimée avec succès.')

      if (editingIntervention?.id === interventionId) {
        resetForm()
      }
    } catch (deleteError) {
      setError(deleteError)
    } finally {
      setDeletingInterventionId(null)
    }
  }

  return (
    <section className="w-full space-y-8">
      <div className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
          Calendrier
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#064E3B]">
          Interventions de la résidence
        </h2>
        <p className="mt-2 text-sm text-[#064E3B]/70">
          Suivi chronologique des entretiens, réparations et passages planifiés.
        </p>
      </div>

      <div
        className={`grid gap-8 ${
          isSyndic ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : ''
        }`}
      >
        <section className="rounded-2xl border border-[#A7F3D0] bg-white shadow-sm">
          <div className="border-b border-[#A7F3D0]/50 p-6">
            <h3 className="text-xl font-bold text-[#064E3B]">
              Liste chronologique
            </h3>
          </div>

          {interventionsError ? (
            <div className="border-b border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
              Impossible de charger les interventions : {interventionsError.message}
            </div>
          ) : null}

          {interventionsLoading ? (
            <div className="p-6 text-sm text-[#064E3B]/70">
              Chargement des interventions...
            </div>
          ) : null}

          {!interventionsLoading && !interventionsError ? (
            <div className="divide-y divide-[#A7F3D0]/50">
              {interventions.length > 0 ? (
                interventions.map((intervention) => {
                  const isPast = isPastIntervention(intervention.date)

                  return (
                    <article
                      className={`p-6 ${isPast ? 'opacity-50 grayscale' : ''}`}
                      key={intervention.id}
                    >
                      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                        <div>
                          <time
                            className="text-sm font-semibold text-[#059669]"
                            dateTime={intervention.date}
                          >
                            {dateFormatter.format(new Date(intervention.date))}
                          </time>
                          <h4 className="mt-2 text-lg font-bold text-[#064E3B]">
                            {intervention.titre}
                          </h4>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                              typeBadgeStyles[intervention.type] ??
                              typeBadgeStyles.Autre
                            }`}
                          >
                            {intervention.type}
                          </span>
                          {isSyndic ? (
                            <>
                              <button
                                aria-label={`Modifier ${intervention.titre}`}
                                className="rounded-full bg-[#ECFDF5] px-3 py-2 text-sm transition hover:bg-[#059669]/10"
                                onClick={() => startEditing(intervention)}
                                type="button"
                              >
                                ✏️
                              </button>
                              <button
                                aria-label={`Supprimer ${intervention.titre}`}
                                className="rounded-full bg-red-50 px-3 py-2 text-sm transition hover:bg-red-100"
                                onClick={() =>
                                  setPendingDeleteInterventionId(intervention.id)
                                }
                                type="button"
                              >
                                🗑️
                              </button>
                            </>
                          ) : null}
                        </div>
                      </div>
                      <p className="mt-3 leading-7 text-[#064E3B]/75">
                        {intervention.description}
                      </p>
                      {pendingDeleteInterventionId === intervention.id ? (
                        <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                          <p className="text-sm font-semibold text-red-700">
                            Supprimer cette intervention ?
                          </p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            <button
                              className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#064E3B]/75 transition hover:bg-[#ECFDF5]"
                              onClick={() => setPendingDeleteInterventionId(null)}
                              type="button"
                            >
                              Annuler
                            </button>
                            <button
                              className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                              disabled={deletingInterventionId === intervention.id}
                              onClick={() => confirmDelete(intervention.id)}
                              type="button"
                            >
                              {deletingInterventionId === intervention.id
                                ? 'Suppression...'
                                : 'Confirmer'}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  )
                })
              ) : (
                <p className="p-6 text-sm text-[#064E3B]/70">
                  Aucune intervention enregistrée.
                </p>
              )}
            </div>
          ) : null}
        </section>

        {isSyndic ? (
          <aside className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
              {editingIntervention ? 'Modification' : 'Nouvelle intervention'}
            </p>
            <h3 className="mt-2 text-2xl font-bold text-[#064E3B]">
              {editingIntervention
                ? "Modifier l'intervention"
                : 'Ajouter au calendrier'}
            </h3>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
                  Impossible de traiter l'intervention : {error.message}
                </div>
              ) : null}

              {successMessage ? (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
                  {successMessage}
                </div>
              ) : null}

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                  htmlFor="intervention-titre"
                >
                  Titre
                </label>
                <input
                  className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                  id="intervention-titre"
                  onChange={(event) => updateField('titre', event.target.value)}
                  required
                  type="text"
                  value={formValues.titre}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                  htmlFor="intervention-date"
                >
                  Date
                </label>
                <input
                  className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                  id="intervention-date"
                  onChange={(event) => updateField('date', event.target.value)}
                  required
                  type="date"
                  value={formValues.date}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                  htmlFor="intervention-type"
                >
                  Type
                </label>
                <select
                  className="w-full rounded-xl border border-[#A7F3D0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                  id="intervention-type"
                  onChange={(event) => updateField('type', event.target.value)}
                  required
                  value={formValues.type}
                >
                  {TYPES_INTERVENTIONS.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                  htmlFor="intervention-description"
                >
                  Description
                </label>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
                  id="intervention-description"
                  onChange={(event) =>
                    updateField('description', event.target.value)
                  }
                  required
                  value={formValues.description}
                />
              </div>

              <div className="flex flex-col gap-3">
                <button
                  className="w-full rounded-xl bg-[#059669] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#047857] focus:outline-none focus:ring-4 focus:ring-[#059669]/30 disabled:cursor-not-allowed disabled:opacity-70"
                  disabled={saving}
                  type="submit"
                >
                  {saving
                    ? 'Enregistrement...'
                    : editingIntervention
                      ? 'Enregistrer les modifications'
                      : "Ajouter l'intervention"}
                </button>

                {editingIntervention ? (
                  <button
                    className="w-full rounded-xl bg-[#ECFDF5] px-4 py-3 text-sm font-semibold text-[#064E3B]/75 transition hover:bg-[#D1D5DB]"
                    onClick={resetForm}
                    type="button"
                  >
                    Annuler
                  </button>
                ) : null}
              </div>
            </form>
          </aside>
        ) : null}
      </div>
    </section>
  )
}

export default Calendrier
