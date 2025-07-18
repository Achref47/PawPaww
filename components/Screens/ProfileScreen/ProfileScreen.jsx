import {
  View,
  Text,
  Image,
  TouchableOpacity,
  useWindowDimensions,
  FlatList,
   StyleSheet,
} from "react-native";
import React, { useCallback, useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import { COLORS, FONTS, SIZES, images } from "../../../constants";
import { StatusBar } from "expo-status-bar";
import { SceneMap, TabBar, TabView } from "react-native-tab-view";
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, query, updateDoc, getDocs, where, getFirestore, onSnapshot } from 'firebase/firestore';
import UserComponent from "../../UserComponent";
import { ScrollView } from "react-native-gesture-handler";


//

const PhotosRoutes = (props) => {
  return(
    <View style={{ flex: 1 }}>
    <FlatList
      data={props?.pet_images}
      numColumns={3}
      renderItem={({ item, index }) => (
        <View
          style={{
            flex: 1,
            aspectRatio: 1,
            margin: 3,
          }}
        >
          <Image
            key={index}
            source={{uri:item}}
            style={{ width: "100%", height: "100%", borderRadius: 12 }}
          />
        </View>
      )}
    />
  </View>
  )
  }
;

const LikesRoutes = ({likesAccounts}) => {
  console.log(likesAccounts)
  return(
    <ScrollView contentContainerStyle={{justifyContent:"center",alignItems:"center"}}>
      {
        likesAccounts.length!=0 ?(
          likesAccounts.map((user)=>(
            <UserComponent email={user.email} phoneNumber={user.phoneNumber} userImage={user.userImage} style={{width:"80%"}} />
          ))
        ):(
          <MaterialCommunityIcons name="heart-broken" size={50} color="pink" style={{marginVertical:50}} />
        )
      }
    </ScrollView>
  )
};



const Profile = ({navigation,route}) => {
  const db=getFirestore()
  const [user,setUser]=useState(route.params.user);
  const [petData,setPetData]=useState(null);
  const [likesAccounts,setLikesAcconts]=useState([]);
  const [visible, setVisible] = useState(false);

  const showModal = () => setVisible(true);
  const hideModal = () => setVisible(false);
  const containerStyle = { backgroundColor: 'white'};

  if(!user?.hasPetProfile){
    return(
      <SafeAreaView style={{flex:1,justifyContent:"center",alignItems:"center"}}>
        <View style={{width:SIZES.width-80,flexDirection:"row"}} >
          <MaterialIcons name="pets" size={100} color="pink" />
          <View style={{width:"50%",justifyContent:"center",alignItems:"center"}}>
            <Text style={{textAlign:"center",...FONTS.h4}}>
              You don't have access to this page yet,
            </Text>
            <Text style={{...FONTS.h1}}>
              Create Your Profile First!
            </Text>
          </View>
        </View>
        <View>
          <TouchableOpacity onPress={()=>navigation.navigate("petProfileCreation")} style={{backgroundColor:"pink",borderWidth:2,padding:10,borderRadius:SIZES.radius-15,marginTop:10}}>
            <Text style={{color:COLORS.white,...FONTS.h2}}>
              Go To Profile Page
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }
  const fetchPetData=useCallback(async ()=>{
    const q=query(collection(db,"pets"),where("userId","==",user.userId));
    const querySnapShot=await getDocs(q);
    setPetData(querySnapShot.docs[0].data());
  },[user.userId])
  useEffect(()=>{
    fetchPetData()
  },[user])
  console.log(petData)

  //fetch likes accounts:
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
  console.log(user)
  useEffect(()=>{
    const fetchLikesAccounts = async () => {
      if (user?.likes) {
        const uniqueUserIds = [...new Set(user.likes)];
        for (const userId of uniqueUserIds) {
          await getUsers(userId,setLikesAcconts);
        }
      }
    };
    fetchLikesAccounts();
  },[route.params.user])



  const layout = useWindowDimensions();
  const [index, setIndex] = useState(0);
  const [routes] = useState([
    { key: "first", title: "Photos" },
    { key: "second", title: "Likes" },
  ]);
  const renderScene = SceneMap({
    first: ()=><PhotosRoutes {...petData} /> ,
    second: ()=><LikesRoutes likesAccounts={likesAccounts} />,
    });
  const renderTabBar = (props) => (
    <TabBar
      {...props}
      indicatorStyle={{
        backgroundColor: COLORS.primary,
      }}
      style={{
        backgroundColor: COLORS.white,
        height: 44,
      }}
      renderLabel={({ focused, route }) => (
        <Text style={[{ color: focused ? COLORS.black : COLORS.gray }]}>
          {route.title}
          
        </Text>
      )}
    />
  );
  return (
   
    

    <SafeAreaView
    
      style={{
        flex: 1,
        backgroundColor: COLORS.white,
      }}
    >
      <StatusBar backgroundColor={"pink"} />
      <View style={{ width: "100%" }}>
        <Image
          source={images.cover}
          resizeMode="cover"
          style={{
            height: 150,
            width: "100%",
          }}
        />
      </View>

      <View style={{ flex: 1, alignItems: "center" }}>
        <Image
          source={{uri:petData?.pet_image}}
          resizeMode="cover"
          style={{
            height: 155,
            width: 155,
            borderRadius: 999,
            borderColor: "pink",
            borderWidth: 2,
            marginTop: -90,
          }}
        />

        <Text
          style={{
            ...FONTS.h3,
            color: COLORS.primary,
            marginVertical: 8,
          }}
        >
          {petData?.pet_name} 
        </Text>
        <Text
          style={{
            color: COLORS.black,
            ...FONTS.body4,
          }}
        >
          {petData?.animal_type}
        </Text>

        <View
          style={{
            flexDirection: "row",
            marginVertical: 6,
            alignItems: "center",
          }}
        >
          <MaterialIcons name="location-on" size={24} color="pink" />
          <Text
            style={{
              ...FONTS.body4,
              marginLeft: 4,
            }}
          >
            Tunis, Tunisia.
          </Text>
        </View>

        <View
          style={{
            paddingVertical: 8,
            flexDirection: "row",
          }}
        >
          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              marginHorizontal: SIZES.padding,
            }}
          >
            <Text
              style={{
                ...FONTS.h2,
                color: COLORS.primary,
              }}
            >
              {user?.friends.length}
            </Text>
            <Text
              style={{
                ...FONTS.body4,
                color: COLORS.primary,
              }}
            >
              Followers
            </Text>
          </View>

          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              marginHorizontal: SIZES.padding,
            }}
          >
            <Text
              style={{
                ...FONTS.h2,
                color: COLORS.primary,
              }}
            >
              {user?.friends.length}
            </Text>
            <Text
              style={{
                ...FONTS.body4,
                color: COLORS.primary,
              }}
            >
              Followings
            </Text>
          </View>

          <View
            style={{
              flexDirection: "column",
              alignItems: "center",
              marginHorizontal: SIZES.padding,
            }}
          >
            <Text
              style={{
                ...FONTS.h2,
                color: COLORS.primary,
              }}
            >
              {user?.likes.length}
            </Text>
            <Text
              style={{
                ...FONTS.body4,
                color: COLORS.primary,
              }}
            >
              Likes
            </Text>
          </View>
        </View>

        <View>
  <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
    <TouchableOpacity
      style={{
        width: 124,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'pink',
        borderRadius: 10,
        marginHorizontal: SIZES.padding * 2,
      }}
      onPress={() => {
        navigation.push('petProfileCreation');
      }}
    >
      <Text style={{ ...FONTS.body4, color: COLORS.white }}>Edit Profile</Text>
    </TouchableOpacity>

    <TouchableOpacity
      style={{
        width: 124,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'pink',
        borderRadius: 10,
        marginHorizontal: SIZES.padding * 2,
      }}
      onPress={() => {
        navigation.navigate('matchesScreen');
      }}
    >
      <Text style={{ ...FONTS.body4, color: COLORS.white }}>Matches</Text>
    </TouchableOpacity>
  </View>

  <ScrollView >
  
  <TouchableOpacity
    onPress={() => {
      navigation.push('Pet Profile Share', { petData: petData });
    }}
    style={{
      width: 124,
      height: 36,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: 'pink',
      borderRadius: 10,
      marginHorizontal: SIZES.padding * 2,
      marginTop: 20,
      marginLeft: 100,
    }}
  >
    <Text style={{ ...FONTS.body4, color: COLORS.white }}>Share Profile</Text>
  </TouchableOpacity>
</ScrollView>

  
  

    
</View>

      </View>

      <View style={{ flex: 0.75, marginHorizontal: 22, marginTop: 20 }}>
        <TabView
          navigationState={{ index, routes }}
          renderScene={renderScene}
          onIndexChange={setIndex}
          initialLayout={{ width: layout.width }}
          renderTabBar={renderTabBar}
        />
      </View>
    </SafeAreaView>
    
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    
  },
  modalContent: {
    flex: 1,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
  

  },
  
});


export default Profile;