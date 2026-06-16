import { useEffect, useRef, useState } from 'react'
import { deleteDoc, doc } from 'firebase/firestore'
import { db } from '../firebase'

const dateFormatter = new Intl.DateTimeFormat('fr-FR', {
  day: '2-digit',
  month: 'long',
  year: 'numeric',
})

const ANNOUNCEMENT_PREVIEW_LENGTH = 220

function MurAnnonces({ annonces, isSyndic, onDelete, onEdit }) {
  const [pendingDeleteAnnonceId, setPendingDeleteAnnonceId] = useState(null)
  const [deletingAnnonceId, setDeletingAnnonceId] = useState(null)
  const [expandedAnnonceIds, setExpandedAnnonceIds] = useState([])
  const [error, setError] = useState(null)
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

  const confirmDelete = async (annonceId) => {
    setDeletingAnnonceId(annonceId)
    setError(null)

    try {
      await deleteDoc(doc(db, 'annonces', annonceId))
      setPendingDeleteAnnonceId(null)
      onDelete?.(annonceId)
      showSuccessMessage('Annonce supprimée avec succès.')
    } catch (deleteError) {
      setError(deleteError)
    } finally {
      setDeletingAnnonceId(null)
    }
  }

  const toggleAnnonceExpansion = (annonceId) => {
    setExpandedAnnonceIds((currentExpandedAnnonceIds) =>
      currentExpandedAnnonceIds.includes(annonceId)
        ? currentExpandedAnnonceIds.filter(
            (expandedAnnonceId) => expandedAnnonceId !== annonceId,
          )
        : [...currentExpandedAnnonceIds, annonceId],
    )
  }

  return (
    <section className="w-full rounded-2xl border border-[#A7F3D0] bg-white shadow-sm">
      <div className="border-b border-[#A7F3D0]/50 p-6">
        <p className="text-sm font-medium uppercase tracking-[0.2em] text-[#059669]">
          Mur d'annonces
        </p>
      </div>

      {error ? (
        <div className="border-b border-red-100 bg-red-50 p-6 text-sm font-medium text-red-700">
          Impossible de supprimer l'annonce : {error.message}
        </div>
      ) : null}

      {successMessage ? (
        <div className="border-b border-emerald-100 bg-emerald-50 p-6 text-sm font-medium text-emerald-700">
          {successMessage}
        </div>
      ) : null}

      <div className="divide-y divide-[#A7F3D0]/50">
        {annonces.map((annonce) => {
          const isExpanded = expandedAnnonceIds.includes(annonce.id)
          const isLongAnnouncement =
            annonce.contenu.length > ANNOUNCEMENT_PREVIEW_LENGTH
          const visibleContent =
            isLongAnnouncement && !isExpanded
              ? `${annonce.contenu.slice(0, ANNOUNCEMENT_PREVIEW_LENGTH).trim()}...`
              : annonce.contenu

          return (
            <article className="p-6" key={annonce.id}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <time
                    className="text-sm font-medium text-[#064E3B]/70"
                    dateTime={annonce.date.toISOString()}
                  >
                    {dateFormatter.format(annonce.date)}
                  </time>
                  <h3 className="mt-2 text-xl font-bold text-[#064E3B]">
                    {annonce.titre}
                  </h3>
                </div>

                {isSyndic ? (
                  <div className="flex flex-wrap gap-2">
                    <button
                      aria-label={`Modifier ${annonce.titre}`}
                      className="rounded-full bg-[#ECFDF5] px-3 py-2 text-sm transition hover:bg-[#059669]/10"
                      onClick={() => onEdit?.(annonce)}
                      type="button"
                    >
                      ✏️
                    </button>
                    <button
                      aria-label={`Supprimer ${annonce.titre}`}
                      className="rounded-full bg-red-50 px-3 py-2 text-sm transition hover:bg-red-100"
                      onClick={() => setPendingDeleteAnnonceId(annonce.id)}
                      type="button"
                    >
                      🗑️
                    </button>
                  </div>
                ) : null}
              </div>
              <p className="mt-3 leading-7 text-[#064E3B]/75">{visibleContent}</p>
              {isLongAnnouncement ? (
                <button
                  className="mt-2 text-sm font-semibold text-[#059669] transition hover:text-[#047857]"
                  onClick={() => toggleAnnonceExpansion(annonce.id)}
                  type="button"
                >
                  {isExpanded ? 'Voir moins' : 'Voir plus'}
                </button>
              ) : null}

              {pendingDeleteAnnonceId === annonce.id ? (
                <div className="mt-4 rounded-xl border border-red-100 bg-red-50 p-4">
                  <p className="text-sm font-semibold text-red-700">
                    Supprimer cette annonce ?
                  </p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-[#064E3B]/75 transition hover:bg-[#ECFDF5]"
                      onClick={() => setPendingDeleteAnnonceId(null)}
                      type="button"
                    >
                      Annuler
                    </button>
                    <button
                      className="rounded-full bg-red-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-70"
                      disabled={deletingAnnonceId === annonce.id}
                      onClick={() => confirmDelete(annonce.id)}
                      type="button"
                    >
                      {deletingAnnonceId === annonce.id
                        ? 'Suppression...'
                        : 'Confirmer'}
                    </button>
                  </div>
                </div>
              ) : null}
            </article>
          )
        })}
      </div>
    </section>
  )
}

export default MurAnnonces
