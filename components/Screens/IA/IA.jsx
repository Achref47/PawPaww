import React, { useState, useEffect } from 'react';
import { StatusBar, View, Text, TextInput, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { FontAwesome, Entypo } from '@expo/vector-icons';
import LottieView from 'lottie-react-native';
import * as GoogleGenerativeAI from '@google/generative-ai';
import FlashMessage, { showMessage } from 'react-native-flash-message';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
export default function IA() {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [showStopIcon, setShowStopIcon] = useState(false);
  const [username, setUsername] = useState('');
  const authInstance = getAuth();

  const API_KEY = 'AIzaSyDnbdtDnKDk_JilhoAWu7R0tZrZezLvEks'; 
  
  function highlightNames(text) {
    const regex = /\*\*(.*?)\*\*/g;
    return text.split(regex).map((part, index) => {
      if (index % 2 === 1) { 
        return <Text key={index} style={{ fontWeight: 'bold' }}>{part}</Text>;
      } else {
        return part;
      }
    });
  }
  
  
  useEffect(() => {

    const startChat = async () => {
      try {
        const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const prompt = `hello! i will ask you about pets so whenver i write a message answer me in super short way sayin  Hi  ${username} ${""} Ask me anything about pets a i would love to help`;
        const result = await model.generateContent(prompt);
        const response = result.response;
        const text = highlightNames(response.text());
        console.log(text);
        showMessage({
          message: 'Welcome to Gemini Chat 🤖',
          description: text,
          type: 'info',
          icon: 'info',
          duration: 2000,
        });
        setMessages([{ text, user: 'system' }]);
      } catch (error) {
        console.error('Error starting chat:', error);
      }
    };
    startChat();
    const unsubscribe = onAuthStateChanged(authInstance, (user) => {
      if (user) {
        console.log(user)
        console.log("ID:", user.email);
        if (user.username === null || user.username == undefined) {
          setUsername(user.email.substring(0, 6));
          console.log("Username:", user.email.substring(0, 6));
        } else {
          setUsername(user.username);
          
          console.log("Username:", user.username);
        }
        
      }
      
  });
  return () => unsubscribe(); 
  }, []);

  const sendMessage = async () => {
    try {
      setLoading(true);
      const userMessage = { text: userInput, user: 'user' };
      setMessages((prevMessages) => [...prevMessages, userMessage]);

      const genAI = new GoogleGenerativeAI.GoogleGenerativeAI(API_KEY);
      const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
      const prompt = userMessage.text;
      const result = await model.generateContent(prompt);
      const response = result.response;
      const text = response.text();
      setMessages((prevMessages) => [...prevMessages, { text, user: 'system' }]);
      setLoading(false);
      setUserInput('');
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const clearMessages = () => {
    setMessages([]);
    setIsSpeaking(false);
  };
  

  const renderMessage = ({ item }) => (
    <View style={[
      styles.messageContainer,
      item.user === 'user' ? styles.userMessageContainer : styles.systemMessageContainer
    ]}>
      <Text style={[
        styles.messageText,
        item.user === 'user' ? styles.userMessageText : styles.systemMessageText
      ]}>
        <Text style={item.user === 'user' ? styles.boldGoldText : styles.boldDarkRedText}>
          {item.user === 'user' ? username : 'System'}:
        </Text>{" "}
        {item.text}
      </Text>
    </View>
  );
  
  
  
  
  
 

  return (
    <View style={styles.container}>
     

      <StatusBar style="auto" />
      <View style={styles.welcome}>
        <LottieView style={{ flex: 1 }} source={require('../../../assets/welcome.json')} autoPlay loop />
      </View>
      <Text style={styles.text}>Welcome To AI ChatBot 🤖</Text>
      
      <FlatList
      style={styles.bg}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item, index) => index.toString()}
        
      />
      
      <View style={styles.inputContainer}>
        <TextInput
          placeholder="Type a message"
          onChangeText={setUserInput}
          value={userInput}
          onSubmitEditing={sendMessage}
          style={styles.input}
          placeholderTextColor="#fff"
        />
       
      </View>
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    backgroundColor : '#ffebcd',

    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 10
  },
  welcome: {
    height: 300,
    aspectRatio: 1,
  },
  text: {
    fontSize: 27,
    fontWeight: 'bold',
  },
  messageContainer: { padding: 10, marginVertical: 5 },
  messageText: { fontSize: 16 },
  inputContainer: { flexDirection: "row", alignItems: "center", padding: 10 },
  input: {
    flex: 1,
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 10,
    height: 50,
    color: "white",
  },
  stopIcon: {
    padding: 10,
    backgroundColor: "#131314",
    borderRadius: 25,
    height: 50,
    width: 50,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 3,
  },
  userMessage: {
    textAlign: 'left',
    fontFamily :'Times New Roman',

  },
  systemMessage: {
    color: 'black',
    textAlign: 'left',
    fontFamily :'Times New Roman',

  },

  boldGoldText: {
      fontWeight: 'bold',
      color: '#B59410',
      fontSize: 17,
      fontFamily :'Times New Roman',


    },

    boldDarkRedText : {
      fontWeight: 'bold',
      color: '#8B0000',
      fontSize: 17,
      fontFamily :'Times New Roman',


    },
    bg : {
      margin : 10,
backgroundColor : '#ffebcd',
padding : 7,
    },
  
});
