import {
  collection,
  doc,
  getDocs,
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
      telephone: '',
      email: '',
    },
  }
})

export function seedResidents() {
  if (seedResidentsPromise) {
    return seedResidentsPromise
  }

  seedResidentsPromise = async function runSeedResidents() {
    const residentsRef = collection(db, 'residents')
    const existingResidents = await getDocs(residentsRef)

    if (!existingResidents.empty) {
      const batch = writeBatch(db)
      let hasMissingContactFields = false

      existingResidents.forEach((residentDocument) => {
        const resident = residentDocument.data()

        if (!('telephone' in resident) || !('email' in resident)) {
          hasMissingContactFields = true
          batch.set(
            residentDocument.ref,
            {
              telephone: resident.telephone ?? '',
              email: resident.email ?? '',
            },
            { merge: true },
          )
        }
      })

      if (hasMissingContactFields) {
        await batch.commit()
      }

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
