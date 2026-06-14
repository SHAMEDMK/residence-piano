import { useState } from 'react'
import useSyndicMode from '../hooks/useSyndicMode'
import { getSyndicPassword } from '../utils/finance'

const navigationItems = [
  'Accueil',
  'Cotisations',
  'Dépenses',
  'Annonces',
  'Contacts',
  'Calendrier',
]

function Header({ activePage, onNavigate }) {
  const { isSyndic, setIsSyndic, theme, setTheme } = useSyndicMode()
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [password, setPassword] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const isDarkTheme = theme === 'dark'

  const closeModal = () => {
    setIsModalOpen(false)
    setPassword('')
    setPasswordError('')
  }

  const handleAccessClick = () => {
    if (isSyndic) {
      setIsSyndic(false)
      closeModal()
      return
    }

    setIsModalOpen(true)
  }

  const handleSubmit = (event) => {
    event.preventDefault()

    if (password !== getSyndicPassword()) {
      setPasswordError('Mot de passe incorrect.')
      return
    }

    setIsSyndic(true)
    closeModal()
  }

  const toggleTheme = () => {
    setTheme(isDarkTheme ? 'light' : 'dark')
  }

  return (
    <header className="border-b border-[#aa3bff]/20 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#aa3bff]">
            Espace syndic
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-[#2e0f44] md:text-3xl">
            Résidence Piano
          </h1>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center">
          <nav aria-label="Navigation principale">
            <ul className="flex flex-wrap gap-2">
              {navigationItems.map((item) => (
                <li key={item}>
                  <button
                    className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                      activePage === item
                        ? 'bg-[#aa3bff] text-white shadow-sm'
                        : 'text-slate-700 hover:bg-[#aa3bff]/10 hover:text-[#922ee0]'
                    }`}
                    onClick={() => onNavigate(item)}
                    type="button"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          <button
            className={`rounded-full px-4 py-3 text-sm font-semibold transition ${
              isSyndic
                ? 'bg-slate-900 text-white hover:bg-slate-800'
                : 'bg-[#aa3bff]/10 text-[#2e0f44] hover:bg-[#aa3bff]/20'
            }`}
            onClick={handleAccessClick}
            type="button"
          >
            {isSyndic ? '🔓 Quitter Syndic' : '🔒 Accès Syndic'}
          </button>

          <button
            aria-label={
              isDarkTheme ? 'Passer en mode clair' : 'Passer en mode sombre'
            }
            className="flex h-11 w-11 items-center justify-center rounded-full bg-[#aa3bff]/10 text-xl transition hover:bg-[#aa3bff]/20"
            onClick={toggleTheme}
            type="button"
          >
            {isDarkTheme ? '☀️' : '🌙'}
          </button>
        </div>
      </div>

      {isModalOpen ? (
        <div
          aria-labelledby="syndic-login-title"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4"
          role="dialog"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#aa3bff]">
                  Accès privé
                </p>
                <h2
                  className="mt-2 text-2xl font-bold text-[#2e0f44]"
                  id="syndic-login-title"
                >
                  Connexion syndic
                </h2>
              </div>

              <button
                aria-label="Fermer la fenêtre de connexion"
                className="rounded-full px-3 py-1 text-xl leading-none text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                onClick={closeModal}
                type="button"
              >
                x
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-slate-700"
                  htmlFor="syndic-password"
                >
                  Mot de passe
                </label>
                <input
                  autoFocus
                  className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none transition focus:border-[#aa3bff] focus:ring-4 focus:ring-[#aa3bff]/20"
                  id="syndic-password"
                  onChange={(event) => {
                    setPassword(event.target.value)
                    setPasswordError('')
                  }}
                  required
                  type="password"
                  value={password}
                />
              </div>

              {passwordError ? (
                <p className="rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-medium text-red-700">
                  {passwordError}
                </p>
              ) : null}

              <button
                className="w-full rounded-xl bg-[#aa3bff] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#922ee0] focus:outline-none focus:ring-4 focus:ring-[#aa3bff]/30"
                type="submit"
              >
                Se connecter
              </button>
            </form>
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Header
