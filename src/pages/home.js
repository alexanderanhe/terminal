import React, { useEffect, useState } from 'react';
import { getAuth } from "firebase/auth";
import { collection, getDocs, addDoc } from 'firebase/firestore';

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal'
import { db } from '../firebase/FirebaseConfig';

export default function Home({ history }) {
  const [ prefix , setPrefix ] = useState("");
  const [{ userTree, ascii }, dispatch] = useAppContext();


  const logic = ({code: cmd}) => {
    if (["hello", "game", "art"].indexOf(cmd) >= 0) {
      const response = ascii[cmd];
      dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: cmd, block: true, response } });
    } else if (cmd === "getData") {
      const getData = async() => {
        try {
          const data = await getDocs(collection(db, 'users'));
          const res = data.docs;
          dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: cmd, response: res.map((e) => e.data().name) } });
        } catch(err) {
          dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: cmd, error: true, response: [err.message] } });
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
          dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: cmd, response: [ `Added user with reference ${docRef.id}` ] } });
        } catch(err) {
          dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: cmd, error: true, response: [err.message] } });
        }
      })();
    } else if (cmd.replace(/\s+/g, "") === "chat") {
      history.push('/chat')
    } else {
      dispatch({ type: "CONSOLESCREEN", payload: { prefix, command: cmd, error: true, response: [`Command "${cmd}" not found`] } });
    }
  }

  useEffect(() => {}, []);

  return (
    <div className="terminal-container">
      <Terminal logic={logic} userTree={userTree} prefix={prefix} setPrefix={setPrefix} />
    </div>
  )
}
