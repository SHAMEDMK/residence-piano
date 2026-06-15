import { useState } from 'react'
import useSyndicMode from '../hooks/useSyndicMode'
import { getSyndicPassword } from '../utils/finance'

const navigationItems = [
  'Accueil',
  'Cotisations',
  'Cotisations exceptionnelles',
  'Dépenses',
  'Annonces',
  'Contacts',
  'Calendrier',
]

function Header({ activePage, onNavigate }) {
  const { isSyndic, setIsSyndic, theme, setTheme } = useSyndicMode()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
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

  const handleNavigate = (item) => {
    onNavigate(item)
    setIsMobileMenuOpen(false)
  }

  return (
    <header className="border-b border-[#059669] bg-[#059669] text-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 py-5 sm:px-6 md:py-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.2em] text-white/80 sm:text-sm">
              Espace syndic
            </p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-white md:text-3xl">
              Résidence Piano
            </h1>
          </div>

          <div className="flex shrink-0 items-center gap-2 md:hidden">
            <button
              aria-label={isSyndic ? 'Quitter l’accès Syndic' : 'Accès Syndic'}
              className={`flex h-11 w-11 items-center justify-center rounded-full text-xl font-semibold transition ${
                isSyndic
                  ? 'bg-white text-[#064E3B] hover:bg-[#ECFDF5]'
                  : 'bg-white/15 text-white hover:bg-white/25'
              }`}
              onClick={handleAccessClick}
              type="button"
            >
              {isSyndic ? '🔓' : '🔒'}
            </button>

            <button
              aria-label={
                isDarkTheme ? 'Passer en mode clair' : 'Passer en mode sombre'
              }
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl transition hover:bg-white/25"
              onClick={toggleTheme}
              type="button"
            >
              {isDarkTheme ? '☀️' : '🌙'}
            </button>

            <button
              aria-expanded={isMobileMenuOpen}
              aria-label={
                isMobileMenuOpen
                  ? 'Fermer le menu de navigation'
                  : 'Ouvrir le menu de navigation'
              }
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-2xl font-semibold leading-none text-[#064E3B] transition hover:bg-[#ECFDF5]"
              onClick={() =>
                setIsMobileMenuOpen((currentIsOpen) => !currentIsOpen)
              }
              type="button"
            >
              {isMobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <nav aria-label="Navigation principale">
              <ul className="flex flex-wrap gap-2">
                {navigationItems.map((item) => (
                  <li key={item}>
                    <button
                      className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                        activePage === item
                          ? 'bg-white text-[#064E3B] shadow-sm'
                          : 'text-white/90 hover:bg-white/15 hover:text-white'
                      }`}
                      onClick={() => handleNavigate(item)}
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
                  ? 'bg-white text-[#064E3B] hover:bg-[#ECFDF5]'
                  : 'bg-white/15 text-white hover:bg-white/25'
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
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white/15 text-xl transition hover:bg-white/25"
              onClick={toggleTheme}
              type="button"
            >
              {isDarkTheme ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        <nav
          aria-label="Navigation mobile"
          className={`grid overflow-hidden transition-all duration-300 ease-in-out md:hidden ${
            isMobileMenuOpen
              ? 'mt-5 max-h-96 opacity-100'
              : 'max-h-0 opacity-0'
          }`}
        >
          <div className="rounded-2xl border border-[#A7F3D0] bg-white p-3 shadow-sm">
            <ul className="grid gap-2">
              {navigationItems.map((item) => (
                <li key={item}>
                  <button
                    className={`flex min-h-11 w-full items-center rounded-xl px-4 py-3 text-left text-sm font-semibold transition ${
                      activePage === item
                        ? 'bg-[#059669] text-white shadow-sm'
                        : 'text-[#064E3B]/80 hover:bg-[#059669]/10 hover:text-[#047857]'
                    }`}
                    onClick={() => handleNavigate(item)}
                    type="button"
                  >
                    {item}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </nav>
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
                <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
                  Accès privé
                </p>
                <h2
                  className="mt-2 text-2xl font-bold text-[#064E3B]"
                  id="syndic-login-title"
                >
                  Connexion syndic
                </h2>
              </div>

              <button
                aria-label="Fermer la fenêtre de connexion"
                className="rounded-full px-3 py-1 text-xl leading-none text-[#14B8A6]/70 transition hover:bg-[#ECFDF5] hover:text-[#064E3B]/80"
                onClick={closeModal}
                type="button"
              >
                x
              </button>
            </div>

            <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
              <div>
                <label
                  className="mb-2 block text-sm font-medium text-[#064E3B]/80"
                  htmlFor="syndic-password"
                >
                  Mot de passe
                </label>
                <input
                  autoFocus
                  className="w-full rounded-xl border border-[#A7F3D0] bg-white px-4 py-3 text-sm text-[#064E3B] outline-none transition focus:border-[#059669] focus:ring-4 focus:ring-[#059669]/20"
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
                className="w-full rounded-xl bg-[#059669] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#047857] focus:outline-none focus:ring-4 focus:ring-[#059669]/30"
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
