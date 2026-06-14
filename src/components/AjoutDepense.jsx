import { useEffect, useRef, useState } from 'react'
import { addDoc, collection, doc, updateDoc } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES_DEPENSES, DEVISE } from '../utils/finance'

function getTodayDateInputValue() {
  return new Date().toISOString().slice(0, 10)
}

function AjoutDepense({ editingDepense, onCancelEdit }) {
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
        {editingDepense ? 'Modification' : 'Nouvelle sortie'}
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[#064E3B]">
        {editingDepense ? 'Modifier la dépense' : 'Ajouter une dépense'}
      </h2>

      {successMessage ? (
        <div className="mt-6 rounded-xl border border-emerald-100 bg-emerald-50 p-4 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <DepenseForm
        editingDepense={editingDepense}
        key={editingDepense?.id ?? 'new-depense'}
        onCancelEdit={onCancelEdit}
        onSuccess={showSuccessMessage}
      />
    </aside>
  )
}

function getInitialFormValues(editingDepense) {
  return {
    date: editingDepense?.date ?? getTodayDateInputValue(),
    motif: editingDepense?.motif ?? '',
    categorie: editingDepense?.categorie ?? CATEGORIES_DEPENSES[0],
    montant:
      editingDepense?.montant === undefined ? '' : String(editingDepense.montant),
    payeur: editingDepense?.payeur ?? '',
    justificatif: editingDepense?.justificatif ?? null,
  }
}

function DepenseForm({ editingDepense, onCancelEdit, onSuccess }) {
  const [formValues, setFormValues] = useState(() =>
    getInitialFormValues(editingDepense),
  )
  const [fileName, setFileName] = useState(
    editingDepense?.justificatif ? 'Justificatif existant conservé' : '',
  )
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)
  const fileInputRef = useRef(null)

  const resetForm = () => {
    setFormValues(getInitialFormValues(null))
    setFileName('')
    setError(null)
    onCancelEdit?.()

    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setError(null)
  }

  const handleFileChange = (event) => {
    const file = event.target.files?.[0]

    if (!file) {
      if (!editingDepense) {
        updateField('justificatif', null)
        setFileName('')
      }
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

    const depenseData = {
      date: formValues.date,
      motif: formValues.motif.trim(),
      categorie: formValues.categorie,
      montant: Number(formValues.montant),
      payeur: formValues.payeur.trim(),
      justificatif: formValues.justificatif,
    }

    try {
      if (editingDepense) {
        await updateDoc(doc(db, 'depenses', editingDepense.id), depenseData)
        onSuccess('Dépense modifiée avec succès.')
      } else {
        await addDoc(collection(db, 'depenses'), {
          ...depenseData,
        })
        onSuccess('Dépense ajoutée avec succès.')
      }

      resetForm()
      form.reset()
    } catch (submitError) {
      setError(submitError)
    } finally {
      setSaving(false)
    }
  }

  return (
    <form
      className="mt-6 space-y-5"
      key={editingDepense?.id ?? 'new-depense-form'}
      onSubmit={handleSubmit}
    >
        {error ? (
          <div className="rounded-xl border border-red-100 bg-red-50 p-4 text-sm font-medium text-red-700">
            Impossible de traiter la dépense : {error.message}
          </div>
        ) : null}

        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#064E3B]/80"
            htmlFor="date-depense"
          >
            Date
          </label>
          <input
            className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
            id="date-depense"
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
            htmlFor="motif"
          >
            Motif
          </label>
          <input
            className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
            id="motif"
            onChange={(event) => updateField('motif', event.target.value)}
            required
            type="text"
            value={formValues.motif}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#064E3B]/80"
            htmlFor="categorie"
          >
            Catégorie
          </label>
          <select
            className="w-full rounded-xl border border-[#A7F3D0] bg-white px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
            id="categorie"
            onChange={(event) => updateField('categorie', event.target.value)}
            required
            value={formValues.categorie}
          >
            {CATEGORIES_DEPENSES.map((categorie) => (
              <option key={categorie} value={categorie}>
                {categorie}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#064E3B]/80"
            htmlFor="montant"
          >
            Montant ({DEVISE})
          </label>
          <div className="flex overflow-hidden rounded-xl border border-[#A7F3D0] transition focus-within:border-[#059669] focus-within:ring-4 focus-within:ring-[#059669]/20">
            <input
              className="w-full px-4 py-3 text-sm outline-none"
              id="montant"
              min="0"
              onChange={(event) => updateField('montant', event.target.value)}
              required
              step="0.01"
              type="number"
              value={formValues.montant}
            />
            <span className="flex items-center bg-[#F0FDF4] px-4 text-sm font-semibold text-[#064E3B]/70">
              {DEVISE}
            </span>
          </div>
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#064E3B]/80"
            htmlFor="payeur"
          >
            Payeur
          </label>
          <input
            className="w-full rounded-xl border border-[#A7F3D0] px-4 py-3 text-sm outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
            id="payeur"
            onChange={(event) => updateField('payeur', event.target.value)}
            required
            type="text"
            value={formValues.payeur}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-[#064E3B]/80"
            htmlFor="justificatif"
          >
            Justificatif
          </label>
          <input
            className="w-full rounded-xl border border-dashed border-[#A7F3D0] px-4 py-3 text-sm text-[#064E3B]/75 file:mr-4 file:rounded-full file:border-0 file:bg-[#059669]/10 file:px-4 file:py-2 file:text-sm file:font-medium file:text-[#047857] hover:file:bg-[#059669]/20"
            id="justificatif"
            onChange={handleFileChange}
            ref={fileInputRef}
            type="file"
          />
          {fileName ? (
            <p className="mt-2 text-xs text-[#064E3B]/70">
              Fichier sélectionné : {fileName}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-3">
          <button
            className="w-full rounded-xl bg-[#059669] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#047857] focus:outline-none focus:ring-4 focus:ring-[#059669]/30 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={saving}
            type="submit"
          >
            {saving
              ? 'Enregistrement...'
              : editingDepense
                ? 'Enregistrer les modifications'
                : 'Ajouter la dépense'}
          </button>

          {editingDepense ? (
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

export default AjoutDepense
