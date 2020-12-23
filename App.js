// @refresh reset
import { StatusBar } from 'expo-status-bar';
import React,  { useState, useEffect, useCallback } from 'react';
import AsincStorage from '@react-native-community/async-storage';
import { StyleSheet, Text, View, TextInput, Button } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat'
import * as firebase from 'firebase';
import 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyD-cObUhKbmUgeTG0PEPxekwboSNcCVeKw",
  authDomain: "react-native-chat-149d5.firebaseapp.com",
  projectId: "react-native-chat-149d5",
  storageBucket: "react-native-chat-149d5.appspot.com",
  messagingSenderId: "671561411599",
  appId: "1:671561411599:web:a03bc59056780d82dd077a"
};

if(firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig);
}

const db = firebase.firestore();
const chatsRef = db.collection('chats');

// YellowBox.ignoreWarnings(['Settings a time for a long period of time']);

export default function App() {
  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot((querySnapshot) => {
      const messagesFirestore = querySnapshot
          .docChanges()
          .filter(({ type }) => type === 'added')
          .map(({ doc }) => {
            const message = doc.data();
            return {
              ...message,
              createdAt: message.createdAt.toDate()
            };
          }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
      appendMessages(messagesFirestore);
    })
    return () => unsubscribe();
  }, []);

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages]);

  async function readUser() {
    const user = await AsincStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user))
    }
  }

  async function handlePress() {
    const id = Math.random().toString(36).substring(7);
    const user = {id, name};
    const userJson = JSON.stringify(user);
    await AsincStorage.setItem('user', userJson);
    setUser(user)
  }

  async function handleSend(messages) {
    const writs = messages.map(m => chatsRef.add(m));
    await Promise.all(writs)
  }

  if (!user) {
    return (
        <View style={styles.container}>
          <TextInput
              style={styles.input}
              playceholder="Enter your name"
              value={name}
              onChangeText={setName}
          />
          <Button
              title="Enter the chat"
              onPress={handlePress}
          />
        </View>
    )
  }

  return (
    <GiftedChat
      messages={messages}
      user={user}
      onSend={handleSend}
    />
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30
  },
  input: {
    height: 50,
    width: '100%',
    borderWidth: 1,
    borderColor: 'gray',
    padding: 15,
    marginBottom: 15
  }
});
