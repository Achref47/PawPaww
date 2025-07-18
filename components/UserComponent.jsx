import { View, Text, Image, Dimensions } from 'react-native'
import React from 'react'
import { COLORS, FONTS, SIZES } from '../constants'
import { MaterialIcons } from '@expo/vector-icons'
const screenWidth=Dimensions.get("screen").width
const UserComponent = ({userImage,email,phoneNumber,style}) => {
  return (
    <View style={{flexDirection:"row" ,alignItems:"center",width:"60%",padding:10,gap:10,backgroundColor:"pink",marginTop:10,marginLeft:10,borderRadius:10,...style}}>
      {
        userImage ?(
          <Image source={{uri:userImage}} alt='userimage' width={50} height={50} style={{borderRadius:50}} />
        ):
        (
          <MaterialIcons name='person' size={50} color={COLORS.white} />
        )
      }
      <View style={{gap:2.5,}}>
        <Text style={{...FONTS.h4,color:COLORS.primary}}>
            {email}
        </Text>
        <Text style={{fontSize:12,color:COLORS.secondary,marginLeft:5}}>
            {phoneNumber}
        </Text>
      </View>

    </View>
  )
}

export default UserComponent