import { View, Text } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { createStackNavigator } from '@react-navigation/stack'
import Profile from './ProfileScreen'
import PetProfileCreation from './PetProfileCreation'
import PetQR from '../QR/QRProfileShare'
import MatchesScreen from './matchesScreen'
import { collection, getDocs, getFirestore, onSnapshot, query, where } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'
const Stack=createStackNavigator();
const db=getFirestore()
const auth=getAuth()
const ProfileStack = ({navigation,route}) => {
  const[user,setUser]=useState(null);
  const getUser=async ()=>{
    const q =query(collection(db,'users'),where("userId","==",route.params.user?.userId))
    onSnapshot(q,docsSnap=>{
      setUser({...docsSnap.docs[0].data(),ref:docsSnap.docs[0].ref})
    })
  }
  useEffect( ()=>{
    getUser();
  }
 ,[])
  return (user ? (
      <Stack.Navigator initialRouteName='profileScreen'  >
      <Stack.Screen initialParams={{user:user}} options={{headerShown:false}}  name="profileScreen" component={Profile} />
      <Stack.Screen initialParams={{user:user}} options={{
        title:user.hasPetProfile ? "Edit Your Profile": "create a profile"
      }} name='petProfileCreation' component={PetProfileCreation} />
      <Stack.Screen initialParams={{user:user}} name='matchesScreen'   component={MatchesScreen} />
      <Stack.Screen initialParams={{user:user}} name='Pet Profile Share'   component={PetQR} />

  </Stack.Navigator>
    ):null)
  
  
}

export default ProfileStack