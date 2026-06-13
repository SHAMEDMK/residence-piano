import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'

function normalizeDate(dateValue) {
  if (dateValue?.toDate) {
    return dateValue.toDate()
  }

  return dateValue ? new Date(dateValue) : new Date()
}

function normalizeAnnonce(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    date: normalizeDate(data.date),
    titre: data.titre,
    contenu: data.contenu,
  }
}

function useAnnonces() {
  const [annonces, setAnnonces] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const annoncesQuery = query(
      collection(db, 'annonces'),
      orderBy('date', 'desc'),
    )

    const unsubscribe = onSnapshot(
      annoncesQuery,
      (snapshot) => {
        setAnnonces(snapshot.docs.map(normalizeAnnonce))
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

  return { annonces, loading, error }
}

export default useAnnonces
