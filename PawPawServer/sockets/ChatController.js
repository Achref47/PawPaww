const { GetUserWithUID } = require('./UserController')
const admin = require('firebase-admin')
const {
  initializeApp,
  applicationDefault,
  cert
} = require('firebase-admin/app')
const {
  getFirestore,
  Timestamp,
  FieldValue,
  Filter
} = require('firebase-admin/firestore')

const serviceAccount = require('../Service.json')

initializeApp({
  credential: cert(serviceAccount),
  credentials: {
    private_key: 'AIzaSyDyW2eG1nRhGvP1CMG-DoRaZy4cJQfVEdY', // eslint-disable-line @typescript-eslint/camelcase
    client_email: 'ahmed466khemiri@gmail.com' // eslint-disable-line @typescript-eslint/camelcase
  }
})

const db = getFirestore()

async function saveChatMessage (UID1, UID2, message) {
  console.log('Will save message')
  let chatsDocs = await db.collection('chat').get()
  chatsDocs = chatsDocs.docs
  for (let i = 0; i < chatsDocs.length; i++) {
    const doc = chatsDocs[i].data()
    console.log('current doc:', doc)
    if (doc.members.includes(UID1) && doc.members.includes(UID2)) {
      console.log('this is the right now, will update ...,', chatsDocs[i].id)
      await db
        .collection('chat')
        .doc(chatsDocs[i].id)
        .update({
          messages: admin.firestore.FieldValue.arrayUnion(message)
        })
    }
  }
}

async function GetFriendsForUID (UID) {
  let chatsDocs = await db.collection('chat').get()
  chatsDocs = chatsDocs.docs
  let chats = chatsDocs.map(doc => doc.data())
  console.log('Downloaded chats: ', chats)

  chats = chats.filter(chat => chat.members.includes(UID))
  const friendsUIDs = chats.map(chat => {
    return chat.members.filter(memberUID => memberUID != UID)[0]
  })
  const friends = []
  for(let i = 0; i < friendsUIDs.length; i++){
    const user = await GetUserWithUID(friendsUIDs[i]);
    console.log("hmm user is ", user);
    if(user != null)
        friends.push(user);
  }
  console.log('friends are of', UID, 'are:', friends)
  return friends
}

async function GetChatForUIDs (UID1, UID2) {
  let chatsDocs = await db.collection('chat').get()
  chatsDocs = chatsDocs.docs
  let chats = chatsDocs.map(doc => doc.data())
  return chats.find(
    chat => chat.members.includes(UID1) && chat.members.includes(UID2)
  )
}

module.exports = { GetFriendsForUID, GetChatForUIDs, saveChatMessage }
