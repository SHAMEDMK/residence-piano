import { useState } from 'react'
import { addDoc, collection } from 'firebase/firestore'
import { db } from '../firebase'

const initialFormValues = {
  motif: '',
  montant: '',
  payeur: '',
  justificatif: null,
}

function AjoutDepense() {
  const [formValues, setFormValues] = useState(initialFormValues)
  const [fileName, setFileName] = useState('')
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      updateField('justificatif', null)
      setFileName('')
      return
    }

    updateField('justificatif', URL.createObjectURL(file))
    setFileName(file.name)
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    const form = event.currentTarget

    setSaving(true)
    setError(null)

    try {
      await addDoc(collection(db, 'depenses'), {
        date: new Date().toISOString().slice(0, 10),
        motif: formValues.motif.trim(),
        montant: Number(formValues.montant),
        payeur: formValues.payeur.trim(),
        justificatif: formValues.justificatif,
      })

      setFormValues(initialFormValues)
      setFileName('')
      form.reset()
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <aside className="rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
        Nouvelle sortie
      </p>
      <h2 className="mt-2 text-2xl font-bold text-indigo-950">
        Ajouter une dépense
      </h2>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            Impossible d'ajouter la dépense : {error.message}
          </div>
        ) : null}

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="motif"
          >
            Motif
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            id="motif"
            onChange={(event) => updateField('motif', event.target.value)}
            required
            type="text"
            value={formValues.motif}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="montant"
          >
            Montant
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            id="montant"
            min="0"
            onChange={(event) => updateField('montant', event.target.value)}
            required
            step="0.01"
            type="number"
            value={formValues.montant}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="payeur"
          >
            Payeur
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-indigo-500 focus:ring-4 focus:ring-indigo-100"
            id="payeur"
            onChange={(event) => updateField('payeur', event.target.value)}
            required
            type="text"
            value={formValues.payeur}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="justificatif"
          >
            Justificatif
          </label>
          <input
            className="w-full rounded-xl border border-dashed border-slate-300 px-4 py-3 text-sm text-slate-600 file:mr-4 file:rounded-full file:border-0 file:bg-indigo-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-indigo-700 hover:file:bg-indigo-100"
            id="justificatif"
            onChange={handleFileChange}
            type="file"
          />
          {fileName ? (
            <p className="mt-2 text-xs text-slate-500">
              Fichier sélectionné : {fileName}
            </p>
          ) : null}
        </div>

        <button
          className="w-full rounded-xl bg-indigo-600 px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-200"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Ajout en cours...' : 'Ajouter la dépense'}
        </button>
      </form>
    </aside>
  )
}

export default AjoutDepense
