import React, { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { collection, getDocs, addDoc } from 'firebase/firestore';

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal'
import { db } from '../firebase/FirebaseConfig';
import getBasics from "../helpers/basics";


export default function Home() {
  const [ prefix , setPrefix ] = useState("");
  const [{ userTree }, dispatch] = useAppContext();


  const logic = ({code: cmd}) => {
    if (cmd === "hello") {
      return getBasics()["hello"];
    }  else if (cmd === "game") {
      return getBasics()["game"];
    } else if (cmd === "art") {
      return getBasics()["art"];
    } else if (cmd === "chat") {
      return getBasics()["chat"];
    } else if (cmd === "google" || cmd === "auth") { 
      const signInGoogle = async () => {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        const auth = getAuth();
        auth.languageCode = 'it';
        signInWithPopup(auth, provider)
          .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            const token = credential.accessToken;
            // The signed-in user info.
            const user = result.user;
            console.log(user);
            dispatch({ type: "CONSOLESCREEN", command: cmd, response: [ user.displayName, user.email ] });
            // ...
          }).catch((error) => {
            // Handle Errors here.
            const errorCode = error.code;
            const errorMessage = error.message;
            // The email of the user's account used.
            const email = error.email;
            // The AuthCredential type that was used.
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
            dispatch({ type: "CONSOLESCREEN", command: cmd, error: true, response: [errorMessage] });
          });
      }
      signInGoogle();
    } else if (cmd === "getData") {
      const getData = async() => {
        try {
          const data = await getDocs(collection(db, 'users'));
          const res = data.docs;
          dispatch({ type: "CONSOLESCREEN", command: cmd, response: res.map((e) => e.data().name) });
        } catch(err) {
          dispatch({ type: "CONSOLESCREEN", command: cmd, error: true, response: [err.message] });
        }
      };
      getData();
    } else if (/^addUser (\w+|\/)*/gi.test(cmd)) {
      const name = cmd.substring(8, cmd.length).replace(/\s+/g, "");
      (async() => {
        try {
          var user = getAuth();
          console.log(user.currentUser.uid);
          const docRef = await addDoc(collection(db, "users"), {
            name,
          });
          dispatch({ type: "CONSOLESCREEN", command: cmd, response: [ `Added user with reference ${docRef.id}` ] });
        } catch(err) {
          dispatch({ type: "CONSOLESCREEN", command: cmd, error: true, response: [err.message] });
        }
      })();
    } else {
      return false;
    }
  }

  useEffect(() => {}, []);

  return (
    <Terminal logic={logic} userTree={userTree} prefix={prefix} setPrefix={setPrefix} />
  )
}
