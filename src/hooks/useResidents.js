import { useEffect, useState } from 'react'
import { collection, onSnapshot } from 'firebase/firestore'
import { db } from '../firebase'

function getApartmentNumber(resident) {
  const match = resident.appartement?.match(/\d+/)

  return match ? Number(match[0]) : Number.MAX_SAFE_INTEGER
}

function normalizeResident(documentSnapshot) {
  const data = documentSnapshot.data()
  const documentId = Number(documentSnapshot.id)
  const residentId = Number.isNaN(documentId)
    ? getApartmentNumber(data)
    : documentId

  return {
    id: residentId,
    ...data,
    telephone: data.telephone ?? '',
    email: data.email ?? '',
  }
}

function useResidents() {
  const [residents, setResidents] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const residentsRef = collection(db, 'residents')

    const unsubscribe = onSnapshot(
      residentsRef,
      (snapshot) => {
        const nextResidents = snapshot.docs
          .map(normalizeResident)
          .sort(
            (residentA, residentB) =>
              getApartmentNumber(residentA) - getApartmentNumber(residentB),
          )

        setResidents(nextResidents)
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

  return { residents, loading, error }
}

export default useResidents
