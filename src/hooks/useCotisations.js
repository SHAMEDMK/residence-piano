import { useEffect, useState } from 'react'
import { collection, onSnapshot, query, where } from 'firebase/firestore'
import { db } from '../firebase'
import { getCurrentCotisationYear } from '../utils/finance'

function normalizeCotisation(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    residentId: String(data.residentId),
    mois: Number(data.mois),
    annee: Number(data.annee),
    statut: data.statut === 'impayé' ? 'impaye' : data.statut,
  }
}

function useCotisations(annee = getCurrentCotisationYear()) {
  const [cotisations, setCotisations] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cotisationsRef = collection(db, 'cotisations')
    const cotisationsQuery = query(cotisationsRef, where('annee', '==', annee))

    const unsubscribe = onSnapshot(
      cotisationsQuery,
      (snapshot) => {
        const nextCotisations = snapshot.docs
          .map(normalizeCotisation)
          .sort((cotisationA, cotisationB) => {
            const residentDiff =
              Number(cotisationA.residentId) - Number(cotisationB.residentId)

            if (residentDiff !== 0) {
              return residentDiff
            }

            return cotisationA.mois - cotisationB.mois
          })

        setCotisations(nextCotisations)
        setLoading(false)
        setError(null)
      },
      (snapshotError) => {
        setError(snapshotError)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [annee])

  return { cotisations, loading, error }
}

export default useCotisations
