import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
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
  Autre: 'bg-slate-100 text-slate-600 ring-slate-200',
}

function isPastIntervention(interventionDate) {
  const today = new Date().toISOString().slice(0, 10)

  return interventionDate < today
}

function Calendrier({ interventions, interventionsError, interventionsLoading }) {
  const { isSyndic } = useSyndicMode()
  const [formValues, setFormValues] = useState(initialFormValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

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

    try {
      await addDoc(collection(db, 'interventions'), {
        titre: formValues.titre.trim(),
        date: formValues.date,
        description: formValues.description.trim(),
        type: formValues.type,
      })

      setFormValues(initialFormValues)
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <section className="w-full space-y-8">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#aa3bff]">
          Calendrier
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#2e0f44]">
          Interventions de la résidence
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          Suivi chronologique des entretiens, réparations et passages planifiés.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        <section className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 p-6">
            <h3 className="text-xl font-bold text-[#2e0f44]">
              Liste chronologique
            </h3>
          </div>

          {interventionsError ? (
            <div className="border-b border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
              Impossible de charger les interventions : {interventionsError.message}
            </div>
          ) : null}

          {interventionsLoading ? (
            <div className="p-6 text-sm text-slate-500">
              Chargement des interventions...
            </div>
          ) : null}

          {!interventionsLoading && !interventionsError ? (
            <div className="divide-y divide-slate-100">
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
                            className="text-sm font-semibold text-[#aa3bff]"
                            dateTime={intervention.date}
                          >
                            {dateFormatter.format(new Date(intervention.date))}
                          </time>
                          <h4 className="mt-2 text-lg font-bold text-slate-950">
                            {intervention.titre}
                          </h4>
                        </div>
                        <span
                          className={`w-fit rounded-full px-3 py-1 text-xs font-semibold ring-1 ${
                            typeBadgeStyles[intervention.type] ??
                            typeBadgeStyles.Autre
                          }`}
                        >
                          {intervention.type}
                        </span>
                      </div>
                      <p className="mt-3 leading-7 text-slate-600">
                        {intervention.description}
                      </p>
                    </article>
                  )
                })
              ) : (
                <p className="p-6 text-sm text-slate-500">
                  Aucune intervention enregistrée.
                </p>
              )}
            </div>
          ) : null}
        </section>

        {isSyndic ? (
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#aa3bff]">
              Nouvelle intervention
            </p>
            <h3 className="mt-2 text-2xl font-bold text-[#2e0f44]">
              Ajouter au calendrier
            </h3>

            <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
              {error ? (
                <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
                  Impossible d'ajouter l'intervention : {error.message}
                </div>
              ) : null}

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="intervention-titre"
                >
                  Titre
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
                  id="intervention-titre"
                  onChange={(event) => updateField('titre', event.target.value)}
                  required
                  type="text"
                  value={formValues.titre}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="intervention-date"
                >
                  Date
                </label>
                <input
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
                  id="intervention-date"
                  onChange={(event) => updateField('date', event.target.value)}
                  required
                  type="date"
                  value={formValues.date}
                />
              </div>

              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="intervention-type"
                >
                  Type
                </label>
                <select
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
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
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="intervention-description"
                >
                  Description
                </label>
                <textarea
                  className="min-h-32 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
                  id="intervention-description"
                  onChange={(event) =>
                    updateField('description', event.target.value)
                  }
                  required
                  value={formValues.description}
                />
              </div>

              <button
                className="w-full rounded-xl bg-[#aa3bff] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#922ee0] focus:outline-none focus:ring-4 focus:ring-[#aa3bff]/30 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={saving}
                type="submit"
              >
                {saving ? 'Ajout en cours...' : "Ajouter l'intervention"}
              </button>
            </form>
          </aside>
        ) : (
          <aside className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
            Le formulaire d'ajout d'intervention est réservé à l'accès Syndic.
          </aside>
        )}
      </div>
    </section>
  )
}

export default Calendrier
