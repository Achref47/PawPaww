import {
  StyleSheet,
  SafeAreaView,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Switch,
  Image,
  ActivityIndicator,
  Pressable
} from 'react-native';
import { useCallback, useEffect, useState } from 'react';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { COLORS, FONTS, images } from '../../../constants';
import { MaterialIcons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system';
import * as ImageManipulator from 'expo-image-manipulator';
import { getDownloadURL, ref, uploadBytes, uploadBytesResumable } from "firebase/storage";
import { storage } from '../../../Backend/firebase';
import { collection, getDocs, getFirestore, query, updateDoc, where } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

export default function Settings({navigation,route}) {
  const auth=getAuth()
  const db=getFirestore();
  const [form, setForm] = useState({
    darkMode: true,
    emailNotifications: true,
    pushNotifications: false,
  });
  const [user,setUser]=useState(route.params.user);
  const [userImage,setUserImage]=useState(null);
  const [uploadState,setUploadState]=useState("");
  const [imageSelected,setimageSelected]=useState(false);
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
        const imageRef=ref(storage,`petsImages/${user?.email}/${filename}`);
        var imageUrl=null
        await uploadBytesResumable(imageRef,blob).then((uploadTask)=>{
          // Upload completed successfully, now we can get the download URL
          setUploadState(uploadTask.state)
          console.log("image uploaded");
          const storageRef = ref(storage, `petsImages/${user?.email}/${filename}`);
          imageUrl= getDownloadURL(storageRef).catch((error) => {
            console.log('Error getting download URL: ', error);
          });
      })
        return imageUrl;
    }catch(error){
        console.log(error.message);
        return null
    }
}
const selectImage=async ()=>{
  const saveImage= (image)=>{
      setUserImage(image)
      try {
      } catch (error) {
          console.log(error)
      }
  }
  // check image size if have a size greater then 2MB
  const checkFileSize=(fileSize)=>{
    return (fileSize/1024 /1024)< 2
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
          setUploadState("pending");
          console.log(checkFileSize(result.assets[0].fileSize))
          if(!checkFileSize(result.assets[0].fileSize))
            {
              console.log(result.assets[0].fileSize)
             await ImageManipulator.manipulateAsync(result.assets[0].uri, [], { compress: 0.5 }).then(async(file)=>{
              await uploadImage(file.uri).then((res)=>{
                saveImage(res)
                setimageSelected(true);
              })
             })
            }else{
              await uploadImage(result.assets[0].uri).then((res)=>{
                saveImage(res)
                setimageSelected(true);
              })
              console.log(result.assets[0].fileSize);
            }

      }
  } catch (err) {
      alert("Error upload image: "+err.message);
      console.log(err.message)
  }
}
const UpdateUserImage=async()=>{
  setUserImage(userImage)
  const q =query(collection(db,"users"),where("userId","==",user?.userId));
  const querySnapShot=await getDocs(q);
  console.log(userImage)
  querySnapShot.docs.map((doc)=>{
    updateDoc(doc.ref,{userImage:userImage});
  })
    if(userImage)
    {
      alert("profile picture updated with success");
    }
}
useEffect(()=>{
  if(uploadState=="success"){
    setUploadState("");
  }
  if(imageSelected){
    UpdateUserImage();
  }
},[imageSelected,userImage,uploadState])

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View style={styles.profile}>
          <TouchableOpacity
            onPress={() => {
              // handle onPress
            }}>
            <View style={styles.profileAvatarWrapper}>
              {
                uploadState=="pending" ?
                (
                  <ActivityIndicator size={60}  color="pink" />
                ):
                (
                  userImage || user?.userImage ?(
                    <Image
                    alt="userImage"
                    source={{uri:user?.userImage ?? userImage}}
                    style={styles.profileAvatar} 
                    />
                  )
                  :(
                    <MaterialIcons name="person" size={60} color="pink" />
                  )
                )
              }

              <TouchableOpacity
                onPress={
                    selectImage
                }>
                <View style={styles.profileAction}>
                  <FeatherIcon
                    color="pink"
                    name="edit-3"
                    size={15} />
                </View>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>

          <View>
            <Text style={styles.profileName}>
              {
                user?.username
              }
            </Text>

            <Text style={styles.profileAddress}>
        Jardins Del Menzah 2
            </Text>
          </View>
            <Pressable
              onPress={async()=>{
                await auth.signOut().then(()=>navigation.navigate("Login"));
              }}
             style={{marginTop:20,width:"auto",backgroundColor:COLORS.gray,paddingHorizontal:20,paddingVertical:10,borderRadius:10,flexDirection:"row",gap:10,justifyContent:"center",alignItems:"center"}}>
              <Text style={{...FONTS.h3,textAlign:"center",color:"pink",fontWeight:"700"}}>
                Logout
              </Text>
              <MaterialIcons name='logout' size={20} color="pink" />
            </Pressable>
        </View>


        <ScrollView>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Preferences</Text>

            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}
              style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'white' }]}>
                <FeatherIcon color="pink" name="globe" size={20} />
              </View>

              <Text style={styles.rowLabel}>Language</Text>

              <View style={styles.rowSpacer} />

              <FeatherIcon
                color="pink"
                name="chevron-right"
                size={20} />
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'white' }]}>
                <FeatherIcon color="pink" name="moon" size={20} />
              </View>

              <Text style={styles.rowLabel}>Dark Mode</Text>

              <View style={styles.rowSpacer} />

              <Switch  trackColor={{false:'white',true:'pink'}}
                onValueChange={darkMode => setForm({ ...form, darkMode })}
                value={form.darkMode} />
            </View>

            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}
              style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'white' }]}>
                <FeatherIcon
                  color="pink"
                  name="navigation"
                  size={20} />
              </View>

              <Text style={styles.rowLabel}>Location</Text>

              <View style={styles.rowSpacer} />

              <FeatherIcon
                color="pink"
                name="chevron-right"
                size={20} />
            </TouchableOpacity>

            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'white' }]}>
                <FeatherIcon
                  color="pink"
                  name="at-sign"
                  size={20} />
              </View>

              <Text style={styles.rowLabel}>Email Notifications</Text>

              <View style={styles.rowSpacer} />

              <Switch trackColor={{false:'white',true:'pink'}}
                onValueChange={emailNotifications =>
                  setForm({ ...form, emailNotifications })
                }
                value={form.emailNotifications} />
            </View>

            <View style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'white' }]}>
                <FeatherIcon color="pink" name="bell" size={20} />
              </View>

              <Text style={styles.rowLabel}>Push Notifications</Text>

              <View style={styles.rowSpacer} />

              <Switch trackColor={{false:'white',true:'pink'}}
                onValueChange={pushNotifications =>
                  setForm({ ...form, pushNotifications })
                }
                value={form.pushNotifications} />
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Resources</Text>

            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}
              style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'white' }]}>
                <FeatherIcon color="pink" name="flag" size={20} />
              </View>

              <Text style={styles.rowLabel}>Report Bug</Text>

              <View style={styles.rowSpacer} />

              <FeatherIcon
                color="pink"
                name="chevron-right"
                size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}
              style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'white' }]}>
                <FeatherIcon color="pink" name="mail" size={20} />
              </View>

              <Text style={styles.rowLabel}>Contact Us</Text>

              <View style={styles.rowSpacer} />

              <FeatherIcon
                color="pink"
                name="chevron-right"
                size={20} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                // handle onPress
              }}
              style={styles.row}>
              <View style={[styles.rowIcon, { backgroundColor: 'white' }]}>
                <FeatherIcon color="pink" name="star" size={20} />
              </View>

              <Text style={styles.rowLabel}>Rate in App Store</Text>

              <View style={styles.rowSpacer} />

              <FeatherIcon
                color="pink"
                name="chevron-right"
                size={20} />
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 0,
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
  /** Profile */
  profile: {
    padding: 24,
    backgroundColor: 'white',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileAvatarWrapper: {
    position: 'relative',
  },
  profileAvatar: {
    width: 72,
    height: 72,
    borderRadius: 9999,
  },
  profileAction: {
    position: 'absolute',
    right: -4,
    bottom: -10,
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 9999,
    backgroundColor: 'white',
  },
  profileName: {
    marginTop: 20,
    fontSize: 19,
    fontWeight: '600',
    color: 'black',
    textAlign: 'center',
  },
  profileAddress: {
    marginTop: 5,
    fontSize: 16,
    color: '#989898',
    textAlign: 'center',
  },
  /** Section */
  section: {
    paddingHorizontal: 24,
  },
  sectionTitle: {
    paddingVertical: 12,
    fontSize: 12,
    fontWeight: '600',
    color: 'pink',
    textTransform: 'uppercase',
    letterSpacing: 1.1,
  },
  /** Row */
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    height: 50,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
    marginBottom: 12,
    paddingLeft: 12,
    paddingRight: 12,
  },
  rowIcon: {
    width: 32,
    height: 32,
    borderRadius: 9999,
    marginRight: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowLabel: {
    fontSize: 17,
    fontWeight: '400',
    color: '#0c0c0c',
  },
  rowSpacer: {
    flexGrow: 1,
    flexShrink: 1,
    flexBasis: 0,
  },
});