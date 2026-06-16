import { useEffect, useState } from 'react'
import Accueil from './components/Accueil'
import AjoutAnnonce from './components/AjoutAnnonce'
import AjoutDepense from './components/AjoutDepense'
import Calendrier from './components/Calendrier'
import Contacts from './components/Contacts'
import CotisationsExceptionnelles from './components/CotisationsExceptionnelles'
import Footer from './components/Footer'
import Header from './components/Header'
import JournalDepenses from './components/JournalDepenses'
import MurAnnonces from './components/MurAnnonces'
import ParametresSyndic from './components/ParametresSyndic'
import TableauCotisations from './components/TableauCotisations'
import SyndicModeProvider from './context/SyndicModeProvider'
import { seedResidents } from './data/seedResidents'
import useAnnonces from './hooks/useAnnonces'
import useCotisations from './hooks/useCotisations'
import useCotisationsExceptionnelles from './hooks/useCotisationsExceptionnelles'
import useDepenses from './hooks/useDepenses'
import useInterventions from './hooks/useInterventions'
import useSyndicMode from './hooks/useSyndicMode'

function AppContent() {
  const [activePage, setActivePage] = useState('Accueil')
  const [editingAnnonce, setEditingAnnonce] = useState(null)
  const [editingDepense, setEditingDepense] = useState(null)
  const { isSyndic, theme } = useSyndicMode()
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
    cotisationsExceptionnelles,
    loading: cotisationsExceptionnellesLoading,
    error: cotisationsExceptionnellesError,
  } = useCotisationsExceptionnelles()
  const {
    depenses,
    loading: depensesLoading,
    error: depensesError,
  } = useDepenses()
  const {
    interventions,
    loading: interventionsLoading,
    error: interventionsError,
  } = useInterventions()

  useEffect(() => {
    seedResidents().catch((seedError) => {
      console.error("Erreur lors de l'initialisation des résidents", seedError)
    })
  }, [])

  const renderPage = () => {
    if (activePage === 'Cotisations') {
      return <TableauCotisations />
    }

    if (activePage === 'Cotisations exceptionnelles') {
      return (
        <CotisationsExceptionnelles
          cotisationsExceptionnelles={cotisationsExceptionnelles}
          cotisationsExceptionnellesError={cotisationsExceptionnellesError}
          cotisationsExceptionnellesLoading={cotisationsExceptionnellesLoading}
        />
      )
    }

    if (activePage === 'Dépenses') {
      return (
        <section
          className={`grid w-full gap-8 ${
            isSyndic ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : ''
          }`}
        >
          <JournalDepenses
            cotisations={cotisations}
            cotisationsError={cotisationsError}
            cotisationsLoading={cotisationsLoading}
            cotisationsExceptionnelles={cotisationsExceptionnelles}
            cotisationsExceptionnellesError={cotisationsExceptionnellesError}
            cotisationsExceptionnellesLoading={cotisationsExceptionnellesLoading}
            depenses={depenses}
            depensesError={depensesError}
            depensesLoading={depensesLoading}
            isSyndic={isSyndic}
            onDelete={(depenseId) => {
              if (editingDepense?.id === depenseId) {
                setEditingDepense(null)
              }
            }}
            onEdit={setEditingDepense}
          />
          {isSyndic ? (
            <AjoutDepense
              editingDepense={editingDepense}
              onCancelEdit={() => setEditingDepense(null)}
            />
          ) : null}
        </section>
      )
    }

    if (activePage === 'Annonces') {
      return (
        <section className="w-full space-y-8">
          <div className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
                Annonces
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

          <div
            className={`grid gap-8 ${
              isSyndic ? 'lg:grid-cols-[minmax(0,1fr)_360px]' : ''
            }`}
          >
            <MurAnnonces
              annonces={annonces}
              isSyndic={isSyndic}
              onDelete={(annonceId) => {
                if (editingAnnonce?.id === annonceId) {
                  setEditingAnnonce(null)
                }
              }}
              onEdit={setEditingAnnonce}
            />
            {isSyndic ? (
              <AjoutAnnonce
                editingAnnonce={editingAnnonce}
                onCancelEdit={() => setEditingAnnonce(null)}
              />
            ) : null}
          </div>
        </section>
      )
    }

    if (activePage === 'Contacts') {
      return (
        <Contacts
          cotisations={cotisations}
          cotisationsError={cotisationsError}
          cotisationsLoading={cotisationsLoading}
        />
      )
    }

    if (activePage === 'Calendrier') {
      return (
        <Calendrier
          interventions={interventions}
          interventionsError={interventionsError}
          interventionsLoading={interventionsLoading}
        />
      )
    }

    return (
      <Accueil
        cotisations={cotisations}
        cotisationsError={cotisationsError}
        cotisationsLoading={cotisationsLoading}
        depenses={depenses}
        depensesError={depensesError}
        depensesLoading={depensesLoading}
        interventions={interventions}
        interventionsError={interventionsError}
        interventionsLoading={interventionsLoading}
        cotisationsExceptionnelles={cotisationsExceptionnelles}
        cotisationsExceptionnellesError={cotisationsExceptionnellesError}
        cotisationsExceptionnellesLoading={cotisationsExceptionnellesLoading}
      />
    )
  }

  return (
    <div
      className="min-h-screen bg-[#F0FDF4] text-[#064E3B]"
      data-theme={theme}
    >
      <Header activePage={activePage} onNavigate={setActivePage} />

      <main className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-4 py-8 sm:px-6 lg:py-16">
        {renderPage()}
        {isSyndic ? <ParametresSyndic /> : null}
      </main>
      <Footer />
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
