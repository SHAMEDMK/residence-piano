import useResidents from '../hooks/useResidents'
import {
  getCotisationPeriodMonths,
  getCotisationStatus,
} from '../utils/finance'

const months = getCotisationPeriodMonths()

function getUnpaidCount(residentId, cotisations) {
  return months.filter(
    (month) =>
      getCotisationStatus(
        cotisations,
        residentId,
        month.mois,
        month.annee,
      ) === 'impaye',
  ).length
}

function Contacts({ cotisations, cotisationsError, cotisationsLoading }) {
  const {
    residents,
    loading: residentsLoading,
    error: residentsError,
  } = useResidents()
  const loading = residentsLoading || cotisationsLoading
  const error = residentsError ?? cotisationsError

  return (
    <section className="w-full space-y-8">
      <div className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
          Contacts
        </p>
        <h2 className="mt-2 text-2xl font-bold text-[#064E3B]">
          Coordonnées des résidents
        </h2>
        <p className="mt-2 text-sm text-[#064E3B]/70">
          Retrouvez les contacts et le statut des cotisations de chaque
          appartement.
        </p>
      </div>

      {error ? (
        <div className="rounded-2xl border border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
          Impossible de charger les contacts : {error.message}
        </div>
      ) : null}

      {loading ? (
        <div className="rounded-2xl border border-[#A7F3D0] bg-white p-6 text-sm text-[#064E3B]/70 shadow-sm">
          Chargement des contacts...
        </div>
      ) : null}

      {!loading && !error ? (
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {residents.map((resident) => {
            const unpaidCount = getUnpaidCount(resident.id, cotisations)
            const isUpToDate = unpaidCount === 0

            return (
              <article
                className="rounded-2xl border border-[#A7F3D0] bg-white p-6 shadow-sm"
                key={resident.id}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-bold text-[#064E3B]">
                      {resident.nom}
                    </h3>
                    <p className="mt-1 text-sm font-medium text-[#059669]">
                      {resident.appartement}
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      isUpToDate
                        ? 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100'
                        : 'bg-red-50 text-red-700 ring-1 ring-red-100'
                    }`}
                  >
                    {isUpToDate ? 'En règle' : `${unpaidCount} impayés`}
                  </span>
                </div>

                <div className="mt-5 space-y-3 text-sm text-[#064E3B]/75">
                  {resident.telephone ? (
                    <a
                      className="flex items-center gap-2 transition hover:text-[#059669]"
                      href={`tel:${resident.telephone}`}
                    >
                      <span aria-hidden="true">📞</span>
                      <span>{resident.telephone}</span>
                    </a>
                  ) : (
                    <p className="flex items-center gap-2 text-[#14B8A6]/70">
                      <span aria-hidden="true">📞</span>
                      <span>Téléphone non renseigné</span>
                    </p>
                  )}

                  {resident.email ? (
                    <a
                      className="flex items-center gap-2 transition hover:text-[#059669]"
                      href={`mailto:${resident.email}`}
                    >
                      <span aria-hidden="true">✉️</span>
                      <span>{resident.email}</span>
                    </a>
                  ) : (
                    <p className="flex items-center gap-2 text-[#14B8A6]/70">
                      <span aria-hidden="true">✉️</span>
                      <span>Email non renseigné</span>
                    </p>
                  )}
                </div>
              </article>
            )
          })}
        </div>
      ) : null}
    </section>
  )
}

export default Contacts
