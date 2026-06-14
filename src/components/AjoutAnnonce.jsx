import { useState } from 'react'
import { addDoc, collection, Timestamp } from 'firebase/firestore'
import { db } from '../firebase'

const initialFormValues = {
  titre: '',
  contenu: '',
}

function AjoutAnnonce() {
  const [formValues, setFormValues] = useState(initialFormValues)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setError(null)

    try {
      await addDoc(collection(db, 'annonces'), {
        date: Timestamp.now(),
        titre: formValues.titre.trim(),
        contenu: formValues.contenu.trim(),
      })

      setFormValues(initialFormValues)
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <aside className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#aa3bff]">
        Nouvelle annonce
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[#2e0f44]">
        Publier un message
      </h2>

      <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            Impossible de publier l'annonce : {error.message}
          </div>
        ) : null}

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="titre-annonce"
          >
            Titre
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
            id="titre-annonce"
            onChange={(event) => updateField('titre', event.target.value)}
            required
            type="text"
            value={formValues.titre}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="contenu-annonce"
          >
            Contenu
          </label>
          <textarea
            className="min-h-36 w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
            id="contenu-annonce"
            onChange={(event) => updateField('contenu', event.target.value)}
            required
            value={formValues.contenu}
          />
        </div>

        <button
          className="w-full rounded-xl bg-[#aa3bff] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#922ee0] focus:outline-none focus:ring-4 focus:ring-[#aa3bff]/30 disabled:cursor-not-allowed disabled:opacity-70"
          disabled={saving}
          type="submit"
        >
          {saving ? 'Publication...' : "Publier l'annonce"}
        </button>
      </form>
    </aside>
  )
}

export default AjoutAnnonce
