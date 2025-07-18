import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  SafeAreaView,
  View,
  Image,
  TextInput,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import COLORS1 from "../../../constants/colors"
import COLORS from "../../../constants/colors"
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import pets from '../../../constants/pets';
import { collection, addDoc, query, updateDoc, getDocs, where, getFirestore, onSnapshot } from 'firebase/firestore';
import { MaterialIcons } from '@expo/vector-icons';
import { FONTS,SIZES } from '../../../constants';
import { getAuth } from 'firebase/auth';
const {height} = Dimensions.get('window');


const petCategories = [
  {name: 'CATS', icon: 'cat'},
  {name: 'DOGS', icon: 'dog'},
  {name: 'BIRDS', icon: 'ladybug'},
  {name: 'BUNNIES', icon: 'rabbit'},
];

const Card = ({pet, navigation,userId}) => {
  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={() => navigation.navigate('DetailsScreen', {pet,userId:userId})}>
      <View style={style.cardContainer}>
        {/* Render the card image */}
        <View style={style.cardImageContainer}>
          <Image
            source={{uri:pet.pet_image}}
            style={{
              width: '100%',
              height: '100%',
              resizeMode: 'contain',
            }}
          />
        </View>

        {/* Render all the card details here */}
        <View style={style.cardDetailsContainer}>
          {/* Name and gender icon */}
          <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
            <Text
              style={{fontWeight: 'bold', color: COLORS1.dark, fontSize: 20}}>
              {pet?.pet_name}
            </Text>
            {
              pet?.pet_gender=="male" 
              ?(
                <Icon name="gender-male" size={22} color={COLORS1.grey} />
              )
              :
              (
                <Icon name="gender-female" size={22} color={COLORS1.grey} />
              )
            }
          </View>

          {/* Render the age and type */}
          <Text style={{fontSize: 12, marginTop: 5, color: COLORS1.dark}}>
            {pet?.pet_type}
          </Text>
          <Text style={{fontSize: 10, marginTop: 5, color: COLORS1.grey}}>
            {pet?.pet_age}
          </Text>

          {/* Render distance and the icon */}
          <View style={{marginTop: 5, flexDirection: 'row'}}>
            <Icon name="map-marker" color={"pink"} size={18} />
            <Text style={{fontSize: 12, color: COLORS1.grey, marginLeft: 5}}>
              Distance:7.8km
            </Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const HomeScreen = ({navigation,route,userId}) => {
const db=getFirestore()
const auth=getAuth()

  const [selectedCategoryIndex, setSeletedCategoryIndex] = React.useState(0);
  const [filteredPets, setFilteredPets] = React.useState([]);
  const [petsData,setPetsData]=useState();
// get Pets from firestore
  useEffect(()=>{
    const petsRef=query(collection(db,'pets'),where("userId","!=",route.params.user.userId));
    const subscriber=onSnapshot(petsRef,{
        next:(snapshot)=>{
            let pets=[];
            snapshot.forEach(doc => {
                pets.push({
                    id:doc.id,
                    ...doc.data(),
                })
            });     
            setPetsData(pets);
            const setPetRandom = (pets) => {
              const randomIndex = Math.floor(Math.random() * pets.length);
              const randomPet = pets[randomIndex];
              // Use randomPet or perform any operation you need
            };

        }   
    })
},[])
// console.log(petsData)
  const fliterPet = index => {
    const currentPets = petsData.filter(
      item => item?.pet_category?.toUpperCase() == petCategories[index].name,
    );
    setFilteredPets(currentPets);
  };

  React.useEffect(() => {
    if(petsData){
      fliterPet(0);
    }
  }, []);
  return (
    <SafeAreaView style={{flex: 1, color: COLORS1.white}}>
      <View style={style.header}>
        <Icon name="sort-variant" size={28} onPress={navigation.toggleDrawer} />
        <Text style={{color:"pink", fontWeight: 'bold', fontSize: 16}}>
          HOME
        </Text>

          <TouchableOpacity
    onPress={() => {
      navigation.push('RandomPet', {pett,userId:userId});
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
        {
          route.params.user?.userImage ?(
            <Image
            source={{uri:route.params.user?.userImage}}
            style={{height: 30, width: 30, borderRadius: 25}}
          />
          ):
        
          (
            <MaterialIcons name="person" size={40} color="pink" />
          )
        }

      </View>
      <View >
        <View style={style.mainContainer}>
          {/* Render the search inputs and icons */}
          <View style={style.searchInputContainer}>
            <Icon name="magnify" size={24} color={COLORS1.grey} />
            <TextInput
              placeholderTextColor={COLORS1.grey}
              placeholder="Search for a friend"
              style={{flex: 1}}
            />
            <Icon name="sort-ascending" size={24} color={COLORS1.grey} />
          </View>

          {/* Render all the categories */}
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              marginTop: 20,
            }}>
            {petCategories.map((item, index) => (
              <View key={'pet' + index} style={{alignItems: 'center'}}>
                <TouchableOpacity
                  onPress={() => {
                    setSeletedCategoryIndex(index);
                    fliterPet(index);
                  }}
                  style={[
                    style.categoryBtn,
                    {
                      backgroundColor:
                        selectedCategoryIndex == index
                          ? "pink"
                          : COLORS1.white,
                    },
                  ]}>
                  <Icon
                    name={item.icon}
                    size={30}
                    color={
                      selectedCategoryIndex == index
                        ? COLORS1.white
                        : "pink"
                    }
                  />
                </TouchableOpacity>
                <Text style={style.categoryBtnName}>{item.name}</Text>
              </View>
            ))}
          </View>

          {/* Render the cards with flatlist */}
          <View  style={{marginTop: 20,justifyContent:"center"}}>
              {
                filteredPets.length ? (
                  <FlatList
                  showsVerticalScrollIndicator={false}
                  data={filteredPets}
                  keyExtractor={(item)=>item.id}
                  contentContainerStyle={{ paddingBottom: 230 }}
                  renderItem={({item}) => 
                    {
                      // console.log("item",item)
                      return(
                        <>
                        <Card pet={item} navigation={navigation} userId={route.params.user.userId} />
                        <HomeScreen navigation={navigation} userId={route.params.user.userId} />
                        </>
                      )
                    }
                  }
                />
                )
                :
                (
                  <View style={{flexDirection:"row",alignSelf:"center",alignItems:"center",justifyContent:"center"}} >
                    <MaterialIcons name="pets" size={100} color="pink" />
                    <Text style={{...FONTS.h2,width:'40%'}}>
                    Sorry this Kind of pet not available right now 
                    </Text>
                  </View>
                )
              }
          </View>
        </View>
      </View>
    </SafeAreaView>
  );
};

const style = StyleSheet.create({
  header: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainContainer: {
    flex: 1,
    backgroundColor: COLORS1.light,
    borderTopLeftRadius: 40,
    borderTopRightRadius: 40,
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 40,
    minHeight: height,
  },
  searchInputContainer: {
    height: 50,
    backgroundColor: COLORS1.white,
    borderRadius: 7,
    paddingHorizontal: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryBtn: {
    height: 50,
    width: 50,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  categoryBtnName: {
    color: COLORS1.dark,
    fontSize: 10,
    marginTop: 5,
    fontWeight: 'bold',
  },
  cardContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  cardDetailsContainer: {
    height: 110,
    backgroundColor: COLORS1.white,
    flex: 1,
    borderTopRightRadius: 10,
    borderBottomRightRadius: 10,
    padding: 20,
    justifyContent: 'center',
  },
  cardImageContainer: {
    height: 150,
    width: 140,
    backgroundColor: COLORS1.background,
    borderRadius: 20,
  },
});
export default HomeScreen;