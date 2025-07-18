import React, { useCallback, useEffect, useState } from 'react'
import {
  Text,
  ImageBackground,
  SafeAreaView,
  StatusBar,
  View,
  Image,
  StyleSheet,
  TouchableOpacity,
  Pressable
} from 'react-native'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import COLORS from '../../../constants/colors'
import COLORS1 from '../../../constants/colors'
import {
  collection,
  getDocs,
  getFirestore,
  query,
  updateDoc,
  where
} from 'firebase/firestore'
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons'
import { getAuth } from 'firebase/auth'
const Random = ({ navigation, route }) => {
  const db = getFirestore()
  const auth = getAuth()
  const pet = route.params.pet
  const [ownerData, setOwnerData] = useState(null)
  const [isSending, setIsSending] = useState(false)
  const fetch = useCallback(async () => {
    const q = query(collection(db, 'users'), where('userId', '==', pet.userId))
    const querySnapShot = await getDocs(q)
    setOwnerData({
      ...querySnapShot.docs[0].data(),
      ref: querySnapShot.docs[0].ref
    })
  }, [pet.userId])
  useEffect(() => {
    fetch()
  }, [pet])
  const sendFrendshipRequest = async () => {
    setIsSending(true)
    await updateDoc(ownerData.ref, {
      friendshipRequests: [
        ...ownerData?.friendshipRequests,
        route.params.userId
      ]
    })
  }

  //Like Pet account:
  const likePet = async () => {
    try {
      if (ownerData?.likes.includes(route.params.userId)) {
        await updateDoc(ownerData?.ref, {
          likes: ownerData.likes.filter(userId => userId != route.params.userId)
        })
      } else {
        await updateDoc(ownerData?.ref, {
          likes: [...ownerData.likes, route.params.userId]
        })
      }
      fetch()
    } catch (error) {
      console.log(error)
    }
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: COLORS.white }}>
      <StatusBar backgroundColor={COLORS.background} />
      <View style={{ height: 400, backgroundColor: COLORS.background }}>
        <ImageBackground
          resizeMode='cover'
          source={{ uri: pet?.pet_image }}
          style={{
            height: 280,
            top: 20
          }}
        >
          {/* Render  Header */}
          <View style={style.header}>
            <Icon
              name='arrow-left'
              size={28}
              color={COLORS.dark}
              onPress={navigation.goBack}
            />
            <Icon name='dots-vertical' size={28} color={COLORS.dark} />
          </View>
        </ImageBackground>

        <View style={style.detailsContainer}>
          {/* Pet name and gender icon */}
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}
          >
            <Text
              style={{ fontSize: 20, color: COLORS.dark, fontWeight: 'bold' }}
            >
              {pet.pet_name}
            </Text>
            {pet?.pet_gender == 'male' ? (
              <Icon name='gender-male' size={22} color={COLORS1.grey} />
            ) : (
              <Icon name='gender-female' size={22} color={COLORS1.grey} />
            )}
          </View>

          {/* Render Pet type and age */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 5
            }}
          >
            <Text style={{ fontSize: 12, color: COLORS.dark }}>
              {pet.pet_type}
            </Text>
            <Text style={{ fontSize: 13, color: COLORS.dark }}>
              {pet.pet_age}
            </Text>
          </View>

          {/* Render location and icon */}
          <View style={{ marginTop: 5, flexDirection: 'row' }}>
            <Icon name='map-marker' color={'pink'} size={20} />
            <Text style={{ fontSize: 14, color: COLORS.grey, marginLeft: 5 }}>
              9 Rue Khaled Ennajar, El Ghazela
            </Text>
          </View>
        </View>
      </View>

      {/* Comment container */}
      <View style={{ marginTop: 80, justifyContent: 'space-between', flex: 1 }}>
        <View>
          {/* Render user image , name and date */}
          <View style={{ flexDirection: 'row', paddingHorizontal: 20 }}>
            {ownerData?.userImage ? (
              <Image
                source={{ uri: ownerData.userImage }}
                style={{ height: 40, width: 40, borderRadius: 20 }}
              />
            ) : (
              <MaterialIcons name='person' size={40} color='pink' />
            )}
            <View style={{ flex: 1, paddingLeft: 10 }}>
              <Text style={{ color: 'pink', fontSize: 12, fontWeight: 'bold' }}>
                {ownerData?.email.substring(0, ownerData?.email.indexOf('@'))}
              </Text>
              <Text
                style={{
                  color: COLORS.grey,
                  fontSize: 11,
                  fontWeight: 'bold',
                  marginTop: 2
                }}
              >
                Owner
              </Text>
            </View>
            <Text style={{ color: COLORS.grey, fontSize: 12 }}>
              May 25, 2020
            </Text>
          </View>
          <Text style={style.comment}>{pet?.profile_bio}</Text>
        </View>

        {/* Render footer */}
        <View style={style.footer}>
          <TouchableOpacity onPress={likePet} style={style.iconCon}>
            <MaterialCommunityIcons
              name={
                ownerData?.likes.includes(route.params.userId)
                  ? 'cards-heart'
                  : 'cards-heart-outline'
              }
              size={22}
              color={COLORS.white}
            />
          </TouchableOpacity>
          <TouchableOpacity
            disabled={
              ownerData?.friendshipRequests.includes(route.params.userId) ||
              isSending ||
              ownerData?.friends.includes(route.params.userId)
            }
            onPress={async () => {
              try {
                await sendFrendshipRequest().then(() => {
                  alert('frendshipRequest Sended 😊')
                  navigation.goBack()
                  setIsSending(false)
                })
              } catch (error) {
                console.log(error)
              } finally {
                setIsSending(false)
              }
            }}
            style={
              ownerData?.friendshipRequests.includes(route.params.userId) ||
              ownerData?.friends.includes(route.params.userId)
                ? {
                    ...style.btn,
                    backgroundColor: 'white',
                    borderWidth: 1,
                    borderColor: 'pink'
                  }
                : { ...style.btn }
            }
          >
            {ownerData?.friends.includes(route.params.userId) ? (
              <Text style={{ color: 'pink', fontWeight: 'bold', fontSize: 20 }}>
                friend
              </Text>
            ) : ownerData?.friendshipRequests.includes(route.params.userId) ? (
              <Text style={{ color: 'pink', fontWeight: 'bold' }}>
                Already sent a friendship
              </Text>
            ) : (
              <Text style={{ color: COLORS.white, fontWeight: 'bold' }}>
                MATCH
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  )
}

const style = StyleSheet.create({
  detailsContainer: {
    height: 120,
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    flex: 1,
    bottom: -60,
    borderRadius: 18,
    elevation: 10,
    padding: 20,
    justifyContent: 'center'
  },
  comment: {
    marginTop: 10,
    fontSize: 12.5,
    color: COLORS.dark,
    lineHeight: 20,
    marginHorizontal: 20
  },
  footer: {
    height: 100,
    backgroundColor: COLORS.light,
    borderTopRightRadius: 20,
    borderTopLeftRadius: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20
  },
  iconCon: {
    backgroundColor: 'pink',
    width: 50,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15
  },
  btn: {
    backgroundColor: 'pink',
    flex: 1,
    height: 50,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  header: {
    flexDirection: 'row',
    padding: 20,
    justifyContent: 'space-between'
  }
})
export default Random
