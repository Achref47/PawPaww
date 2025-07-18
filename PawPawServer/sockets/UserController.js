const { getFirestore } = require('firebase-admin/firestore')

async function GetUserWithUID (UID) {
  const db = getFirestore()
  const snap = await db.collection('users').where('userId', '==', UID).get()
  const data = snap?.docs[0]?.data()
  return data
}

module.exports = { GetUserWithUID }
