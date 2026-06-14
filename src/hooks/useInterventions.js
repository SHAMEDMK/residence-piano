import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { TYPES_INTERVENTIONS } from '../utils/finance'

function normalizeIntervention(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    titre: data.titre ?? '',
    date: data.date ?? '',
    description: data.description ?? '',
    type: TYPES_INTERVENTIONS.includes(data.type) ? data.type : 'Autre',
  }
}

function useInterventions() {
  const [interventions, setInterventions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const interventionsQuery = query(
      collection(db, 'interventions'),
      orderBy('date', 'asc'),
    )

    const unsubscribe = onSnapshot(
      interventionsQuery,
      (snapshot) => {
        setInterventions(snapshot.docs.map(normalizeIntervention))
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

  return { interventions, loading, error }
}

export default useInterventions
