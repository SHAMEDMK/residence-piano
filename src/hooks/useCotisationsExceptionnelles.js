import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

function normalizeCotisationExceptionnelle(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    titre: data.titre ?? '',
    description: data.description ?? '',
    montant: Number(data.montant ?? 0),
    dateCreation: data.dateCreation ?? null,
    echeance: data.echeance ?? '',
    statuts: data.statuts ?? {},
  }
}

function useCotisationsExceptionnelles() {
  const [cotisationsExceptionnelles, setCotisationsExceptionnelles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const cotisationsExceptionnellesQuery = query(
      collection(db, 'cotisationsExceptionnelles'),
      orderBy('dateCreation', 'desc'),
    )

    const unsubscribe = onSnapshot(
      cotisationsExceptionnellesQuery,
      (snapshot) => {
        setCotisationsExceptionnelles(
          snapshot.docs.map(normalizeCotisationExceptionnelle),
        )
        setLoading(false)
        setError(null)
      },
      (snapshotError) => {
        setError(snapshotError)
        setLoading(false)
      },
    )

    return unsubscribe
  }, [])

  return { cotisationsExceptionnelles, loading, error }
}

export default useCotisationsExceptionnelles
