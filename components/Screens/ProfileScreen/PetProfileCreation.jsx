import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { View, Text, Button, TextInput, Image, StyleSheet, SafeAreaView, KeyboardAvoidingView, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import firestore from '../../../Backend/firebase'; // Import firestore from the Firebase configuration file
import { collection, addDoc, query, updateDoc, getDocs, where, getDoc, onSnapshot } from 'firebase/firestore';
import { SIZES, FONTS, COLORS } from '../../../constants';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { storage } from '../../../Backend/firebase';
import { Picker } from '@react-native-picker/picker';
import { getFirestore } from 'firebase/firestore';
import SegmentedControl from '@react-native-segmented-control/segmented-control';
import { getAuth } from 'firebase/auth';
const PetPictures=({petData})=>{
  console.log(petData)
  if(petData){
    return(
      <>
      {
        petData.pet_images.map((uri)=>(
          <View style={{justifyContent:"center",alignItems:"center",width:SIZES.width/4,height:100,borderRadius:SIZES.radius }}>
            <Image source={{uri:uri}} width={100} height={100} style={{borderRadius:SIZES.radius}} />
          </View>
        ))
      }
      </>
    )
  }
  return(
    <>
    {
        [1,2,3,4,5].map(()=>(
          <View style={{justifyContent:"center",alignItems:"center",width:SIZES.width/4,height:100,backgroundColor:COLORS.white,borderRadius:SIZES.radius ,opacity:0.3}}>
            <Ionicons name='image' size={20} color="#000" />
          </View>
        ))
    }
    </>
  )

}

const db=getFirestore();
const auth=getAuth()
export default function PetProfileCreation({ navigation,route }) {
  const [petName, setPetName] = useState('');
  const [petAge, setPetAge] = useState('');
  const [petGender, setPetGender] = useState('');
  const [petImage, setPetImage] = useState(null);
  const [petImages,setPetImages]=useState([]);
  const [category,setCategory]=useState("");
  const [profileBio,setProfileBio]=useState("");
  const [animalType,setAnimalType]=useState("");
  const [isSubmit,setSubmit]=useState(false);
  const [isUploadingImages,setIsUploadImages]=useState(false);
  const [uploadState,setUploadState]=useState("");
  const [petData,setPetData]=useState(null);
  const [user,setUser]=useState(null)
  const [updateFields,setUpdatesFields]=useState(false)
  //get pet's use if user is already has a pet profile
  const getPet=useCallback(async(user)=>{
    const petRef=query(collection(db,"pets"),where("userId","==",user.userId));
    onSnapshot(petRef,docsSnap=>{
      setPetData({...docsSnap.docs[0].data(),ref:docsSnap.docs[0].ref});
      setUser(route.params.user)
    })
  }, [petData,user])
  useEffect(()=>{
    if(route.params.user){
      getPet(route.params.user)
    }
  },[route.params.user])
  useMemo(()=>{
    setPetName(petData?.pet_name)
    setPetAge(petData?.pet_age)
    setPetGender(petData?.pet_gender)
    setPetImage(petData?.petImage)
    setCategory(petData?.pet_category)
    setProfileBio(petData?.profile_bio)
    setAnimalType(petData?.animal_type)
    console.log(petAge)
  },[petData,user])
 
        //upload image..... and return image uri from firebase storage 
        const uploadImage=async(image)=>{
          if(!image) {
              alert('select  image pls!! ');
              return;
          }

          try{
              const {uri}=await FileSystem.getInfoAsync(image);
              const blob=await new Promise((resolve,reject)=>{
                  const xhr=new XMLHttpRequest();
                  xhr.onload=()=>{
                      resolve(xhr.response);
                  };
                  xhr.onerror=(e)=>{
                      reject(new TypeError('Network request failed'));
                  };
                  xhr.responseType="blob";
                  xhr.open('GET',uri,true);
                  xhr.send(null);
              });
              
              const filename=image.substring(image.lastIndexOf('/')+1);
              const imageRef=ref(storage,`petsImages/${route.params.user.email}/${filename}`);
              var imageUrl=null
                await uploadBytesResumable(imageRef,blob).then((uploadTask)=>{
                  // Upload completed successfully, now we can get the download URL
                  setUploadState(uploadTask.state)
                  console.log("image uploaded");
                  const storageRef = ref(storage, `petsImages/${route.params.user.email}/${filename}`);
                  imageUrl= getDownloadURL(storageRef).catch((error) => {
                    console.log('Error getting download URL: ', error);
                  });
              })
              console.log(imageUrl);
              return imageUrl;
          }catch(error){
              console.log(error.message);
              return null
          }
      }
      // handle create profile ;
  const handleCreateProfile = async () => {

      if(!petImage && !petImages){
        alert("select your Pet images please!!");
        return;
      }
      
      //upload profile....
      try {
        setSubmit(true);
      await uploadImage(petImage).then(async(res)=>{
        console.log(petImages);
         await addDoc(collection(db,'pets'),{
          pet_name:petName,
          pet_age:petAge,
          profile_bio:profileBio,
          animal_type:animalType,
          pet_gender:petGender,
          pet_category:category,
          pet_image:res,
          pet_images:petImages,
          userId:route.params.user.userId
        })
      }).then(()=>{
        alert("profile uploaded with success!!");
        setSubmit(false)
      }).catch((error)=>{
        console.log(error)
      })
    } catch (error) {
        console.log(error)
    }finally{
      setSubmit(false)
    }

  }
  // check image size if have a size greater then 2MB
  const checkFileSize=(fileSize)=>{
    return (fileSize/1024 /1024)< 2
  }

    //select image from library ....
    const selectImage=async ()=>{
      const saveImage= (image)=>{
          setPetImage(image)
          try {
          } catch (error) {
              console.log(error)
          }
      }

      try {
          await ImagePicker.requestMediaLibraryPermissionsAsync();
          let result=await ImagePicker.launchImageLibraryAsync({
              mediaTypes:ImagePicker.MediaTypeOptions.Images,
              allowsEditing:true,
              quality:1,
          })
          if(!result.canceled){
              //save image
              console.log(checkFileSize(result.assets[0].fileSize))
              if(!checkFileSize(result.assets[0].fileSize))
                {
                  console.log(result.assets[0].fileSize)
                 await ImageManipulator.manipulateAsync(result.assets[0].uri, [], { compress: 0.5 }).then(async(file)=>{

                   saveImage(file.uri);
                 })
                }else{
                   saveImage(result.assets[0].uri);
                  console.log(result.assets[0].fileSize);
                }
          }
      } catch (err) {
          alert("Error upload image: "+err.message);
          console.log(err.message)
      }
  }

      //select images from library and uploaded in the same time whene select all 5 images 
      const selectPetPictures=async ()=>{
        try {
            await ImagePicker.requestMediaLibraryPermissionsAsync();
            let result=await ImagePicker.launchImageLibraryAsync({
                mediaTypes:ImagePicker.MediaTypeOptions.Images,
                allowsMultipleSelection:true,
                quality:1,
                selectionLimit:5, //limit 5 pictures 
            })
            if(!result.canceled){
                setUploadState("pending");
                //save image
                let images=[];
                console.log(checkFileSize(result.assets[0].fileSize))
                //loop all pictures files and uploaded on firebase storage 
                result.assets.forEach(async(img)=>{
                  let uri=null;
                  if(!checkFileSize(img.fileSize))
                  {
                    console.log(img.fileSize)
                    await ImageManipulator.manipulateAsync(img.uri, [], { compress: 0.5 }).then(async(file)=>{
                    uri=await uploadImage(file.uri);
                   })
                  }else{
                    uri=await uploadImage(img.uri);
                    console.log(img.fileSize);
                  }
                  images.push(uri);
                  setPetImages([...images]);
                })
                
                console.log(images.length)
                return images;
            }
        } catch (err) {
            alert("Error upload image: "+err.message);
            console.log(err.message)
        }
    }
    useEffect(()=>{
      console.log("uploadState",uploadState)
      if(petImages.length)setIsUploadImages(false);
      console.log(petImages)
    },[petImages])


    //submit Profile
    const submitProfile=async ()=>{
      try {
        await handleCreateProfile().then(async()=>{
          const q =query(collection(db,"users"),where("userId","==",route.params.user.userId));
          const querySnapShot=await getDocs(q);
          console.log(querySnapShot.docs[0].ref);
          querySnapShot.docs.map((doc)=>{
            updateDoc(doc.ref,{hasPetProfile:true});
          })
          alert("accout has been created with success!!");
          navigation.navigate("Home");
          
        
      })
      } catch (error) {
        console.log(error)
      }

    }

    //Edit Pet Profile:
    const updatePetProfile=async ()=>{
      setUpdatesFields(true)
        await updateDoc(petData.ref,{
          pet_name:petName,
          pet_age:petAge,
          profile_bio:profileBio,
          animal_type:animalType,
          pet_gender:petGender,
          pet_category:category,
          pet_image:petImage ?? petData?.pet_image,
          pet_images:petImages.length!=0 ? petImages : petData?.pet_images ,
          userId:route.params.user.userId
      })
    };



  return (
    <SafeAreaView style={{flex:1,alignItems:"center",marginTop:20}} >
      <ScrollView style={{flex:1}}  showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false} >
        <KeyboardAvoidingView style={{width:"90%",marginHorizontal:10}} >
          <Text style={styles.label} >Pet's Name</Text>
          <TextInput 
          style={styles.textInput}
          placeholder={petData?.pet_name ?? "Pet's Name"}
          value={petName}
          onChangeText={(text)=>setPetName(text)}
          />
          <Text style={styles.label} >Pet's Age</Text>
          <TextInput
            placeholder={petData?.pet_age ?? "Pet's Age"}
            value={petAge}
            onChangeText={(text)=>setPetAge(text)}
            style={styles.textInput}
          />
          <Text style={styles.label} >Pofile Bio</Text>
          <TextInput
            placeholder={petData?.profile_bio ?? "Profile bio"}
            value={profileBio}
            onChangeText={(text)=>setProfileBio(text)}
            style={{...styles.textInput,height:80}}
            numberOfLines={5}
          />
          <Text style={styles.label} >Animal Type</Text>
          <TextInput
            placeholder={petData?.animal_type ?? "Animal type"}
            value={animalType}
            onChangeText={(text)=>setAnimalType(text)}
            style={styles.textInput}
          />
          <Text style={styles.label} >Pet's Gender</Text>
            <SegmentedControl
              values={['male', 'female']}
              selectedIndex={petData?.pet_gender ?? petGender}
              onChange={(event) => {
                setPetGender(event.nativeEvent.value);
                console.log(petGender)
              }}
              />
          
          {/* Select Pet category  */}
          <Text style={styles.label} >select category</Text>
          <Picker
          style={{width:"50%",alignSelf:"center"}}
          selectedValue={petData?.pet_category ?? category}
          onValueChange={(itemValue,itemIndex)=>setCategory(itemValue)}
          >
            <Picker.Item label='Cats' value="cats" />
            <Picker.Item label='Dogs' value="dogs" />
            <Picker.Item label='Bunnies' value="bunnies" />
            <Picker.Item label='Birds' value="birds" />
          </Picker>
        </KeyboardAvoidingView>
       {/* select profile image from library */}
        <View style={{justifyContent:"center",alignItems:"center",backgroundColor:"#fff",width:80,height:80,borderRadius:100,alignSelf:"center"}} >
          <View style={{width:"100%",flex:1,justifyContent:"center",alignItems:"center"}} >
              { 
              route.params.user.hasPetProfile && !petImage ?
              (
                <Image source={{uri:petData?.pet_image}} style={{width:"100%",height:"100%",borderRadius:100}} />
              ):(
                !petImage ? (
                  <View style={{width:"100%",height:"100%",justifyContent:"center",alignItems:"center"}}>
                      <Ionicons name='image' size={20} color="#000" />
                  </View>
              ):(
                  <Image source={{uri:petImage}} style={{width:"100%",height:"100%",borderRadius:100}} />
              )
              )

              }
          </View>
        </View>
        <Button
          title="Select pet's picture"
          onPress={selectImage}
        />
          {/* **************** */}
        <View style={{width:SIZES.width-80,height:1,backgroundColor:COLORS.secondaryGray,alignSelf:"center"}} />

        {/* select pet images from library and upload IT all */}
        <View style={{width:SIZES.width,justifyContent:"center",alignItems:"center",flexDirection:"row",flexWrap:"wrap",gap:10,marginVertical:10}} >
          {
            route.params.user.hasPetProfile && uploadState=="" ?
            (
              <PetPictures petData={petData} />
            ):(
              isUploadingImages || uploadState=="pending" ?(
                <>
                  <ActivityIndicator size="small" color="pink" />
                  <Text>Uploading images please wait a minute...</Text>
                </>
              ):(!petImages.length?
                  <PetPictures petData={null} />
                  :
                  (
                    petImages.map((uri)=>(
                      <View key={petImages.indexOf(uri)} style={{justifyContent:"center",alignItems:"center",width:SIZES.width/4,height:100,borderRadius:SIZES.radius}}>
                        <Image source={{uri:uri}} width={100} height={100} />
                      </View>
                    ))
                  )
                )
            )
          }
 
        </View>
          {
            !petImages.length ?(
              <Button
              title={
                
                route.params.user.hasPetProfile ? 
                "Edit pet's pictures":"Select pet's pictures"
                
              } 
              onPress={async()=>{
                setIsUploadImages(true)
                await selectPetPictures().then((res)=>{setIsUploadImages(false)})
              }}
            />
            ):(<>
                <Text style={{alignSelf:"center",...FONTS.h3,color:"pink",textDecorationLine:"underline"}} >images uploaded!!</Text>
              </>
            )
          }
        {/* ************** */}


      </ScrollView>
          {
            !route.params.user.hasPetProfile ?
            (
              
                isSubmit ? (
                  <ActivityIndicator color="pink" size="large"  />
                ):
                (
                <TouchableOpacity
                  disabled={!petName || !petAge || !petGender || !category || !animalType || !petImage ||uploadState!="success"}
                  onPress={submitProfile} 
                  style={{backgroundColor:!petName || !petAge || !petGender || !category || !animalType || !petImage ||uploadState!="success" ? COLORS.secondaryGray : "pink",
                  borderWidth:2,padding:10,borderRadius:SIZES.radius-15,marginTop:10}}>
                  <Text style={{color:COLORS.white,...FONTS.h2}}>
                  Submit your pet profile
                  </Text>
                </TouchableOpacity>
                )
              
            ):
            (
              <TouchableOpacity
              disabled={updateFields}
              onPress={async()=>{
                try {
                  await updatePetProfile().then(()=>{
                    setUpdatesFields(false);
                    alert("Your pet profile has been updated with success !!");
                    navigation.goBack()
                  })
                } catch (error) {
                  console.log(error);
                  setUpdatesFields(false)
                }

              }} 
              style={{backgroundColor: "pink",
              borderWidth:2,padding:10,borderRadius:SIZES.radius-15,marginTop:10}}>
                {
                  updateFields ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  )
                  :(
                    <Text style={{color:COLORS.white,...FONTS.h2}}>
                      Update your pet Profile
                    </Text>
                  )
                }
              </TouchableOpacity>
            )
          }
    </SafeAreaView>
  );
}
const styles=StyleSheet.create({
  textInput:{
    fontSize: 16,
    marginLeft: 6,
    marginVertical: 8, // Increased vertical margin for better spacing
    paddingHorizontal: 10, // Added horizontal padding for better aesthetics
    paddingVertical: 8, // Added vertical padding for better aesthetics
    borderRadius: 8, // Added border radius for rounded corners
    borderWidth: 1, // Added border for visual distinction
    borderColor: '#ccc', // Added border color for visual distinction
  },
  heading:{
    ...FONTS.h1,
    marginBottom:20,
  },
  label:{
    ...FONTS.h4,
    marginVertical:10
  }
})
