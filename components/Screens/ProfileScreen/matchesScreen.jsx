import { Dimensions, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { SceneMap, TabBar, TabView } from 'react-native-tab-view'
import { COLORS, FONTS } from '../../../constants'
import UserComponent from '../../UserComponent'
import { user } from '../../../constants/users'
import { collection, getDoc, addDoc, doc,getDocs, getFirestore, onSnapshot, query, updateDoc, where } from 'firebase/firestore'
import { Entypo, Ionicons, MaterialIcons } from '@expo/vector-icons'
const screenWidth=Dimensions.get("screen").width



const Friends=({user,navigation,userFriends})=>{
return(
    <ScrollView style={{flex:1}}>
        {
          userFriends?.length!=0 ?(
            userFriends?.map((user)=>(
              <View key={user} style={{flexDirection:"row",alignItems:"center"}}>
                <UserComponent email={user.email}  style={{width:"90%"}} phoneNumber={user.phoneNumber} userImage={user.userImage} />
                <View style={{right:50,position:"absolute"}}>
                  <Text style={{color:COLORS.white,...FONTS.h3}}>
                      Friend
                  </Text>
                </View>
              </View>
            ))
          ):<Text style={{...FONTS.h2,marginTop:20,width:"75%",textAlign:"center",color:"pink",fontWeight:"900",width:"auto"}}>
            you dont have any friends
        </Text>
        }
      
    </ScrollView>
)
}

const FriendshipRequestes=({user,friendshipRequesteUser,setFriendshipRequestUser,setUserFriends,userFriends})=>{
  const accepetUser=useCallback(async(acceptedUser)=>{
  const db=getFirestore()
    
    await updateDoc(user?.ref,{
      friends:[
        ...user?.friends,
        acceptedUser.userId
      ]
    }).then(()=>{
      updateDoc(acceptedUser.ref,{
        friends:[
          ...acceptedUser.friends,
          user?.userId
        ]
      })
    }).then(async ()=>{
      const collectionRef = collection(db, "chat");
      const newDocRef = await addDoc(collectionRef, {
        // Your document data as a JavaScript object
        members: [user.userId, acceptedUser.userId],
        messages: [],
        // ... other fields
      });
      console.log("added");
    }).then(()=>{
      setUserFriends([
        ...userFriends,
        ...friendshipRequesteUser.filter((user)=>user.userId==acceptedUser.userId)
      ])
      rejectUser(acceptedUser.userId)
      alert(accepetUser.email,": accepted")
    }).catch(error=>{
      console.log(error);
    })


  })

  const rejectUser=useCallback(async(rejectedUser)=>{
    try {
      const updatedFrendshipRequestes=user?.friendshipRequests.filter((userId)=>userId!=rejectedUser);
       await updateDoc(user?.ref,{
        friendshipRequests:updatedFrendshipRequestes,
      });
      setFriendshipRequestUser(friendshipRequesteUser.filter((user)=>user.userId!=rejectUser));
      
      console.log(updatefriendship)
    } catch (error) {
      console.log(error)
    }
    
  },[friendshipRequesteUser])

// console.log(friendshipRequesteUser)
return(
    <ScrollView contentContainerStyle={{flex:1,alignItems:"center"}} >
      {
        friendshipRequesteUser?.length!=0 ? (
          friendshipRequesteUser?.map((user)=>(
            <View style={{flexDirection:"row",alignItems:"center",gap:10}}>
              <UserComponent email={user.email} style={{width:"60%"}} phoneNumber={user.phoneNumber} userImage={user.userImage}/>
              <TouchableOpacity onPress={()=>accepetUser(user)}
              style={{width:40,height:40,backgroundColor:"pink",justifyContent:"center",alignItems:"center",borderRadius:10}} >
                <MaterialIcons name='done' size={24} color={COLORS.white} />
              </TouchableOpacity>
              <TouchableOpacity onPress={()=>rejectUser(user?.userId)}
              style={{width:40,height:40,backgroundColor:"pink",justifyContent:"center",alignItems:"center",borderRadius:10}} >
                <Entypo name='cross' size={24} color={COLORS.white} />
              </TouchableOpacity>
            </View>
          ))
        ): <Text style={{...FONTS.h2,marginTop:20,width:"75%",textAlign:"center",color:"pink",fontWeight:"900"}}>
          you dont have any Frendship Requestes
        </Text>
      }
      
    </ScrollView>
)
}


const MatchesScreen = ({navigation,route}) => {
  const db=getFirestore()
    const [friendshipRequesteUser,setFriendshipRequestUser]=useState([]);
    const [userFriends,setUserFriends]=useState([]);
    const [user,setUser]=useState(route.params.user)
    const [index, setIndex] = useState(0);
    const getUsers=useCallback(async(userId,setState)=>{
      try {
        const qSnap=query(collection(db,"users"),where("userId","==",userId))
        onSnapshot(qSnap,docsSnap=>{
          setState((prev)=>[...prev,{...docsSnap.docs[0].data(),ref:docsSnap.docs[0].ref}])
        })

      } catch (error) {
        console.log(error)
      }
    }, [route.params.user])
    useEffect(()=>{
      const fetchFriendshipRequests = async () => {
        if (user?.friendshipRequests) {
          const uniqueUserIds = [...new Set(user.friendshipRequests)];
          for (const userId of uniqueUserIds) {
            await getUsers(userId,setFriendshipRequestUser);
          }
        }
      };
      const fetchFriends = async () => {
        if (user?.friends) {
          const uniqueUserIds = [...new Set(user.friends)];
          for (const userId of uniqueUserIds) {
            console.log("userFriends",userFriends)
            await getUsers(userId,setUserFriends);
          }
        }
      };
      fetchFriendshipRequests();
      fetchFriends();
    },[])

    const [routes] = useState([
        { key: "first", title: "Friends" },
        { key: "second", title: "FrendshipRequests" },
      ]);
      const renderScene = SceneMap({
        first: ()=><Friends user={user} navigation={navigation} userFriends={userFriends}   /> ,
        second: ()=><FriendshipRequestes user={user} friendshipRequesteUser={friendshipRequesteUser} setFriendshipRequestUser={setFriendshipRequestUser} setUserFriends={setUserFriends} userFriends={userFriends} />,
        });
      const renderTabBar = (props) => (
        <TabBar
            {...props}
            indicatorStyle={{
            backgroundColor: COLORS.primary,
          }}
          style={{
            backgroundColor: COLORS.white,
            height: "auto",
            width:screenWidth
          }}
          renderLabel={({ focused, route }) => (
            <Text style={[{ color: focused ? COLORS.primary : "#DDD" }]}>
              {route.title}
            </Text>
          )}
        />
      );
  return (
    <SafeAreaView style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width:screenWidth }}
          renderTabBar={renderTabBar}
        />
    </SafeAreaView>
  )
}

export default MatchesScreen

const styles = StyleSheet.create({})