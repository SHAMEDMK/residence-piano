import useSyndicMode from '../hooks/useSyndicMode'
import ModeSyndicToggle from './ModeSyndicToggle'

const navigationItems = ['Accueil', 'Cotisations', 'Dépenses', 'Annonces']

function Header({ activePage, onNavigate }) {
  const { syndicMode, setSyndicMode } = useSyndicMode()

  return (
    <header className="border-b border-indigo-100 bg-white shadow-sm">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 px-6 py-6 xl:flex-row xl:items-center xl:justify-between">
        <div>
          <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
            Espace syndic
          </p>
          <h1 className="mt-2 text-2xl font-bold tracking-tight text-indigo-950 md:text-3xl">
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
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'text-slate-700 hover:bg-indigo-50 hover:text-indigo-700'
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

          <ModeSyndicToggle
            checked={syndicMode}
            onChange={setSyndicMode}
          />
        </div>
      </div>
    </header>
  )
}

export default Header
