
import {createBottomTabNavigator} from '@react-navigation/bottom-tabs'
import React from 'react'
import HomeScreen from '../components/Screens/HomeScreen/HomeScreen';
import Settings from '../components/Screens/Settings/Settings'
import ProfileScreen from '../components/Screens/ProfileScreen/ProfileScreen'
import Ionicons from "react-native-vector-icons/Ionicons";
import Messages from '../components/Screens/Chat/Messages';
import PetProfileCreation from '../components/Screens/ProfileScreen/PetProfileCreation';
import ProfileStack from '../components/Screens/ProfileScreen';
import Ia from '../components/Screens/IA/IA'


const Tab = createBottomTabNavigator();

export default function TabNavigation({socket, apiUrl, user}) {
  console.log("tab:", user);
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === "Profile") {
            iconName = focused ? "people" : "people-outline";
          }
          if (route.name === "Messages") {
            iconName = focused ? "chatbubble" : "chatbubble-outline";
          }
          if (route.name === "Settings") {
            iconName = focused ? "settings" : "settings-outline";
          }
          if (route.name === "AI") {
            iconName = focused ? "rocket" : "rocket-outline";
          }
          if (route.name === "Home") {
            iconName = focused ? "heart" : "heart-outline";
          }
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: "pink",
        tabBarInactiveTintColor: "grey",
      })}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          headerShown: false,
        }}
        initialParams={{
          user
        }}
      />
      <Tab.Screen
        name="AI"
        component={Ia}
        options={{
          headerShown: false,
          headerTitleStyle: { fontSize: 16 },
        }}
        />
      <Tab.Screen
        name="Profile"
        component={ProfileStack}
        options={{
          headerShown: false,
          headerTitleStyle: { fontSize: 16 },
        }}
        initialParams={{
          user
        }}
      />
      {socket &&(
      <Tab.Screen
        name="Messages"
        component={Messages}
        initialParams={{ socket: socket,
          user: user,
          apiUrl: apiUrl, 
        }}
        options={{
          headerShown: false,
          headerTitleStyle: { fontSize: 16 },
          socket: socket,
          user: user,
          apiUrl: apiUrl,
        }}
      />)}
      <Tab.Screen
        name="Settings"
        component={Settings}
        options={{
          headerShown: false,
          headerTitleStyle: { fontSize: 14 },
        }}
        initialParams={{
          user
        }}
      />

      
    </Tab.Navigator>
  );
}


// const Tab = createBottomTabNavigator(); 
// export default function TabNavigations() {
//   return (
//     <View>
//    <Tab.Navigator screenOptions={{headerShown:true}} style={{top:827}}>
//     <Tab.Screen 
//     name='home'component={HomeScreen}
//     options={{tabBarLabel:({color})=>(<Text style={{color:color,fontSize:12}}>Home</Text>),
//     tabBarIcon:({color,size})=>(<AntDesign name="home" size={24} color="black" />
//     )
//   }}
//      />
//     <Tab.Screen 
//     name='category'component={CategoryScreen}
//     options={{tabBarLabel:({color})=>(<Text style={{color:color,fontSize:12}}>Category</Text>),
//     tabBarIcon:({color,size})=>(<AntDesign name="search1" size={24} color="black" />
//     )
//   }}
//      />
//     <Tab.Screen 
//     name='profile'component={ProfileScreen}
//     options={{tabBarLabel:({color})=>(<Text style={{color:color,fontSize:12}}>Profile</Text>),
//     tabBarIcon:({color,size})=>(<AntDesign name="profile" size={24} color="black"  />

//     )
//   }}
//      />
//    </Tab.Navigator>
//    </View>
//   )
// }
// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: 'black',
//     alignItems: 'center',
//     justifyContent: 'center',
    
    
//   },
// });