import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function formatDateInputValue(dateValue) {
  if (!dateValue) {
    return getTodayDateInputValue()
  }

  return dateValue.toISOString().slice(0, 10)
}

function getInitialFormValues(editingAnnonce) {
  return {
    date: editingAnnonce
      ? formatDateInputValue(editingAnnonce.date)
      : getTodayDateInputValue(),
    titre: editingAnnonce?.titre ?? '',
    contenu: editingAnnonce?.contenu ?? '',
  }
}

function AjoutAnnonce({ editingAnnonce, onCancelEdit }) {
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

  return (
    <aside className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
        {editingAnnonce ? 'Modification' : 'Nouvelle annonce'}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[#064E3B]">
        {editingAnnonce ? "Modifier l'annonce" : 'Publier un message'}
      </h2>

      {successMessage ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <AnnonceForm
        editingAnnonce={editingAnnonce}
        key={editingAnnonce?.id ?? 'new-annonce'}
        onCancelEdit={onCancelEdit}
        onSuccess={showSuccessMessage}
      />
    </aside>
  )
}

function AnnonceForm({ editingAnnonce, onCancelEdit, onSuccess }) {
  const [formValues, setFormValues] = useState(() =>
    getInitialFormValues(editingAnnonce),
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setError(null)
  }

  const resetForm = () => {
    setFormValues(getInitialFormValues(null))
    setError(null)
    onCancelEdit?.()
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    setSaving(true)
    setError(null)

    const annonceData = {
      date: new Date(`${formValues.date}T12:00:00`),
      titre: formValues.titre.trim(),
      contenu: formValues.contenu.trim(),
    }

    try {
      if (editingAnnonce) {
        await updateDoc(doc(db, 'annonces', editingAnnonce.id), annonceData)
        onSuccess('Annonce modifiée avec succès.')
      } else {
        await addDoc(collection(db, 'annonces'), {
          ...annonceData,
        })
        onSuccess('Annonce publiée avec succès.')
      }

      resetForm()
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="mt-6 space-y-5"
      key={editingAnnonce?.id ?? 'new-annonce-form'}
      onSubmit={handleSubmit}
    >
      {error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
          Impossible de traiter l'annonce : {error.message}
        </div>
      ) : null}

        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#064E3B]/80"
            htmlFor="date-annonce"
          >
            Date
          </label>
          <input
            className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
            id="date-annonce"
            onChange={(event) => updateField('date', event.target.value)}
            required
            type="date"
            value={formValues.date}
          />
          <p className="mt-2 text-xs text-[#064E3B]/70">
            La date s'affichera au format JJ/MM/AAAA.
          </p>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#064E3B]/80"
            htmlFor="titre-annonce"
          >
            Titre
          </label>
          <input
            className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
            id="titre-annonce"
            onChange={(event) => updateField('titre', event.target.value)}
            required
            type="text"
            value={formValues.titre}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#064E3B]/80"
            htmlFor="contenu-annonce"
          >
            Contenu
          </label>
          <textarea
            className="min-h-36 w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
            id="contenu-annonce"
            onChange={(event) => updateField('contenu', event.target.value)}
            required
            value={formValues.contenu}
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
              : editingAnnonce
                ? 'Enregistrer les modifications'
                : "Publier l'annonce"}
          </button>

          {editingAnnonce ? (
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
  )
}

export default AjoutAnnonce
