import { useEffect, useState } from 'react'
import Accueil from './components/Accueil'
import AjoutAnnonce from './components/AjoutAnnonce'
import AjoutDepense from './components/AjoutDepense'
import Header from './components/Header'
import JournalDepenses from './components/JournalDepenses'
import MurAnnonces from './components/MurAnnonces'
import TableauCotisations from './components/TableauCotisations'
import SyndicModeProvider from './context/SyndicModeProvider'
import { seedResidents } from './data/seedResidents'
import useAnnonces from './hooks/useAnnonces'
import useCotisations from './hooks/useCotisations'
import useDepenses from './hooks/useDepenses'
import useSyndicMode from './hooks/useSyndicMode'

function AppContent() {
  const [activePage, setActivePage] = useState('Accueil')
  const { syndicMode } = useSyndicMode()
  const {
    annonces,
    loading: annoncesLoading,
    error: annoncesError,
  } = useAnnonces()
  const {
    cotisations,
    loading: cotisationsLoading,
    error: cotisationsError,
  } = useCotisations()
  const {
    depenses,
    loading: depensesLoading,
    error: depensesError,
  } = useDepenses()

  useEffect(() => {
    seedResidents().catch((seedError) => {
      console.error("Erreur lors de l'initialisation des résidents", seedError)
    })
  }, [])

  const renderPage = () => {
    if (activePage === 'Cotisations') {
      return <TableauCotisations />
    }

    if (activePage === 'Dépenses') {
      return (
        <section className="grid w-full gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
          <JournalDepenses
            cotisations={cotisations}
            cotisationsError={cotisationsError}
            cotisationsLoading={cotisationsLoading}
            depenses={depenses}
            depensesError={depensesError}
            depensesLoading={depensesLoading}
          />
          <AjoutDepense />
        </section>
      )
    }

    if (activePage === 'Annonces') {
      return (
        <section className="w-full space-y-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-indigo-100 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-indigo-600">
                Annonces
              </p>
              <h2 className="mt-2 text-2xl font-bold text-indigo-950">
                Informations aux résidents
              </h2>
              <p className="mt-2 text-sm text-slate-500">
                Activez le mode Syndic depuis l'en-tête pour publier une annonce.
              </p>
            </div>
          </div>

          {annoncesError ? (
            <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
              Impossible de charger les annonces : {annoncesError.message}
            </div>
          ) : null}

          {annoncesLoading ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
              Chargement des annonces...
            </div>
          ) : null}

          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_360px]">
            <MurAnnonces annonces={annonces} />
            {syndicMode ? (
              <AjoutAnnonce />
            ) : (
              <aside className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500 shadow-sm">
                Le formulaire de publication est réservé au mode Syndic.
              </aside>
            )}
          </div>
        </section>
      )
    }

    return (
      <Accueil
        annonces={annonces}
        annoncesError={annoncesError}
        annoncesLoading={annoncesLoading}
        cotisations={cotisations}
        cotisationsError={cotisationsError}
        cotisationsLoading={cotisationsLoading}
        depenses={depenses}
        depensesError={depensesError}
        depensesLoading={depensesLoading}
      />
    )
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <Header activePage={activePage} onNavigate={setActivePage} />

      <main className="mx-auto flex w-full max-w-7xl px-4 py-8 sm:px-6 lg:py-16">
        {renderPage()}
      </main>
    </div>
  )
}

function App() {
  return (
    <SyndicModeProvider>
      <AppContent />
    </SyndicModeProvider>
  )
}

export default App
