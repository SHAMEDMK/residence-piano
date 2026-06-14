import { useEffect, useState } from 'react'
import { collection, onSnapshot, orderBy, query } from 'firebase/firestore'
import { db } from '../firebase'
import { CATEGORIES_DEPENSES } from '../utils/finance'

function normalizeDepense(documentSnapshot) {
  const data = documentSnapshot.data()

  return {
    id: documentSnapshot.id,
    date: data.date,
    motif: data.motif,
    categorie: CATEGORIES_DEPENSES.includes(data.categorie)
      ? data.categorie
      : 'Divers',
    montant: Number(data.montant),
    payeur: data.payeur,
    justificatif: data.justificatif ?? null,
  }
}

function useDepenses() {
  const [depenses, setDepenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const depensesQuery = query(
      collection(db, 'depenses'),
      orderBy('date', 'desc'),
    )

    const unsubscribe = onSnapshot(
      depensesQuery,
      (snapshot) => {
        setDepenses(snapshot.docs.map(normalizeDepense))
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

  return { depenses, loading, error }
}

export default useDepenses
