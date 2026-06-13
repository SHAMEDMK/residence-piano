import {
  collection,
  doc,
  getDocs,
  limit,
  query,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

let seedResidentsPromise = null

const initialResidents = Array.from({ length: 9 }, (_, index) => {
  const apartmentNumber = index + 1

  return {
    id: String(apartmentNumber),
    data: {
      nom: `Propriétaire Appt ${apartmentNumber}`,
      appartement: `Appartement ${apartmentNumber}`,
    },
  }
})

export function seedResidents() {
  if (seedResidentsPromise) {
    return seedResidentsPromise
  }

  seedResidentsPromise = async function runSeedResidents() {
    const residentsRef = collection(db, 'residents')
    const existingResidents = await getDocs(query(residentsRef, limit(1)))

    if (!existingResidents.empty) {
      return
    }

    const batch = writeBatch(db)

    initialResidents.forEach((resident) => {
      batch.set(doc(residentsRef, resident.id), resident.data)
    })

    await batch.commit()
  }()

  return seedResidentsPromise
}
