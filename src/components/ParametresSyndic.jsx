import { useState } from 'react'
import { getSyndicPassword, setSyndicPassword } from '../utils/finance'

const initialFormValues = {
  ancienMotDePasse: '',
  nouveauMotDePasse: '',
  confirmationMotDePasse: '',
}

function ParametresSyndic() {
  const [formValues, setFormValues] = useState(initialFormValues)
  const [feedback, setFeedback] = useState(null)

  const updateField = (field, value) => {
    setFormValues((currentValues) => ({
      ...currentValues,
      [field]: value,
    }))
    setFeedback(null)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (formValues.ancienMotDePasse !== getSyndicPassword()) {
      setFeedback({
        type: 'error',
        message: "L'ancien mot de passe est incorrect.",
      })
      return
    }

    if (formValues.nouveauMotDePasse.length < 6) {
      setFeedback({
        type: 'error',
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.',
      })
      return
    }

    if (formValues.nouveauMotDePasse !== formValues.confirmationMotDePasse) {
      setFeedback({
        type: 'error',
        message: 'La confirmation ne correspond pas au nouveau mot de passe.',
      })
      return
    }

    try {
      setSyndicPassword(formValues.nouveauMotDePasse)
      setFormValues(initialFormValues)
      setFeedback({
        type: 'success',
        message: 'Mot de passe syndic modifié avec succès.',
      })
    } catch {
      setFeedback({
        type: 'error',
        message: "Impossible d'enregistrer le nouveau mot de passe.",
      })
    }
  }

  return (
    <section className="w-full rounded-2xl border border-[#aa3bff]/20 bg-white p-6 shadow-sm">
      <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#aa3bff]">
        Paramètres syndic
      </p>
      <h2 className="mt-2 text-2xl font-bold text-[#2e0f44]">
        Changer le mot de passe
      </h2>
      <p className="mt-2 text-sm text-slate-500">
        Ce mot de passe est enregistré localement sur cet appareil.
      </p>

      <form className="mt-6 grid gap-5 lg:grid-cols-3" onSubmit={handleSubmit}>
        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="ancien-mot-de-passe"
          >
            Ancien mot de passe
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
            id="ancien-mot-de-passe"
            onChange={(event) =>
              updateField('ancienMotDePasse', event.target.value)
            }
            required
            type="password"
            value={formValues.ancienMotDePasse}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="nouveau-mot-de-passe"
          >
            Nouveau mot de passe
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
            id="nouveau-mot-de-passe"
            minLength="6"
            onChange={(event) =>
              updateField('nouveauMotDePasse', event.target.value)
            }
            required
            type="password"
            value={formValues.nouveauMotDePasse}
          />
        </div>

        <div>
          <label
            className="mb-2 block text-sm font-medium text-slate-700"
            htmlFor="confirmation-mot-de-passe"
          >
            Confirmer le nouveau mot de passe
          </label>
          <input
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
            id="confirmation-mot-de-passe"
            minLength="6"
            onChange={(event) =>
              updateField('confirmationMotDePasse', event.target.value)
            }
            required
            type="password"
            value={formValues.confirmationMotDePasse}
          />
        </div>

        <div className="lg:col-span-3">
          {feedback ? (
            <p
              className={`mb-4 rounded-xl border p-4 text-sm font-medium ${
                feedback.type === 'success'
                  ? 'border-emerald-100 bg-emerald-50 text-emerald-700'
                  : 'border-red-100 bg-red-50 text-red-700'
              }`}
            >
              {feedback.message}
            </p>
          ) : null}

          <button
            className="rounded-xl bg-[#aa3bff] px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#922ee0] focus:outline-none focus:ring-4 focus:ring-[#aa3bff]/30"
            type="submit"
          >
            Changer le mot de passe
          </button>
        </div>
      </form>
    </section>
  )
}

export default ParametresSyndic
