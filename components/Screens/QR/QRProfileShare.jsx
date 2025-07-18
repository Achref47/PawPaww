import React, { useState } from 'react';
import {TouchableOpacity, StyleSheet, View,Text,Dimensions } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Modal, Portal,Provider as PaperProvider } from 'react-native-paper';
const screenWidth=Dimensions.get("screen").width

export default function QR({ navigation, route }) {
  const { petData } = route.params;

  // Destructure properties from petData
  const {
    animal_type,
    pet_age,
    pet_category,
    pet_gender,
    pet_name,
    userId,
    profile_bio,
  } = petData;

  const Bio = petData.profile_bio;

  const id = petData.userId;
  const age = petData.pet_age;
  const Name = petData.pet_name;
  const Gender = petData.pet_gender;
  const pet_Category = petData.pet_category;
  const animal_Type = petData.animal_type;


  const profileData =

    "The Profile Scanned : " +
    "ID : " + id + ", " +
    "Name : " + Name + ", " +
    "Age : " + age + ", " +
    "Gender : " + Gender + ", " +
    "Pet category : " + pet_Category + ", " +
    "Animal Type : " + animal_Type +","+
    "Bio : " + Bio;

  const qrData = JSON.stringify(profileData);

  return (
    <PaperProvider>
      <Portal>
          <View style={styles.container}>
            <QRCode
              value={qrData}
              size={250}
              backgroundColor="pink"
              errorCorrectionLevel="H"
              logo={{ uri: 'https://t4.ftcdn.net/jpg/04/17/87/67/360_F_417876741_pofg19rDWTv6ZmgQ8qTOgVMJ0H3N2uPh.jpg', width: 50, height: 50 }}
              color="white"
            />
          </View>
         
      </Portal>
      <TouchableOpacity style={styles.button} >
      <Text style={{ color: 'white' , fontWeight : 'bold', fontSize : 17}}>Share Profile</Text>

        
        </TouchableOpacity>
    </PaperProvider>
  );
}

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
  button: {
    backgroundColor : 'pink',
     margin : 50,
     padding : 17 ,
     alignItems :'center',

  },
});
