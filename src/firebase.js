import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: 'AIzaSyAoNCG7-TCDTxYRbaqQdekqt4trgpvp6Iw',
  authDomain: 'residence-piano.firebaseapp.com',
  projectId: 'residence-piano',
  storageBucket: 'residence-piano.firebasestorage.app',
  messagingSenderId: '16425908175',
  appId: '1:16425908175:web:caf6f057159dbc7cd104ba',
}

const app = initializeApp(firebaseConfig)

export const db = getFirestore(app)
