import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { collection, getDocs, addDoc } from 'firebase/firestore';

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal'
import { db } from '../firebase/FirebaseConfig';

export default function Home({ history }) {
  const [ prefix , setPrefix ] = useState("");
  const [{ userTree, ascii }, dispatch] = useAppContext();


  const logic = ({ code }) => {
    if (["hello", "game", "art"].indexOf(code) >= 0) {
      const response = ascii[code];
      dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: code, block: true, response } });
    } else if (code.toLowerCase().replace(/\s+/g, "") === "logout") {
      return { type: "LOGOUT" };
    } else if (code === "getData") {
      const getData = async() => {
        try {
          const data = await getDocs(collection(db, 'users'));
          const res = data.docs;
          dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: code, response: res.map((e) => e.data().name) } });
        } catch(err) {
          dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: code, error: true, response: [err.message] } });
        }
      };
      getData();
    } else if (/^addUser (\w+|\/)*/gi.test(code)) {
      const name = code.substring(8, code.length).replace(/\s+/g, "");
      (async() => {
        try {
          var user = getAuth();
          console.log(user.currentUser.uid);
          const docRef = await addDoc(collection(db, "users"), {
            name,
          });
          dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: code, response: [ `Added user with reference ${docRef.id}` ] } });
        } catch(err) {
          dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: code, error: true, response: [err.message] } });
        }
      })();
    } else if (/^chat([0-9a-zA-Z]+)*/gi.test(code)) {
      const room = code.substring(4, code.length).replace(/\s+/g, "");
      history.push(`/chat/${room}`);
    } else {
      dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: code, error: true, response: [`Command "${code}" not found`] } });
    }
  }

  useEffect(() => {}, []);

  return (
    <Terminal logic={logic} userTree={userTree} prefix={prefix} setPrefix={setPrefix} />
  )
}
