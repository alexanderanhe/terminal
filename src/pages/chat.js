import React, { useEffect, useState } from 'react';
// import { getAuth } from "firebase/auth";
// import { collection, getDocs, addDoc } from 'firebase/firestore';

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal'
// import { db } from '../firebase/FirebaseConfig';

const PROCESS = [
  {
    output: ["Type roomId:"],
    input: "room",
    regex: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-5][0-9a-f]{3}-[089ab][0-9a-f]{3}-[0-9a-f]{12}$/i
  },
];

export default function Chat() {
  // eslint-disable-next-line no-unused-vars
  const [{ user, ascii, lang }, dispatch] = useAppContext();
  const [prefix, setPrefix] = useState("");
  const [process, setProcess] = useState({
    step: 0,
    form: {}
  });

  const login = (form, callback) => {
    const keys = PROCESS.map((process) => process.input);
    const formKeys = Object.keys(form).filter((field) => form[field]);
    const intersection = keys.filter((key) => formKeys.includes(key));
    console.log("intersection", intersection, keys, formKeys);
    if (intersection.length === PROCESS.length) {
      setPrefix(user.email);
      callback(form);
    }
  };

  const handleSubmit = ({ code }) => {
    const { step, form } = process;
    const input = code.replace(/\s+/g, "");
    if (step <= PROCESS.length - 1) {
      if (PROCESS[step].regex.test(input)) {
        const newForm = {
          ...form,
          [PROCESS[step].input]: input
        };
        setProcess({
          ...process,
          step: step + 1,
          form: newForm
        });
        dispatch({ type: "CONSOLESCREEN", payload: {
          command: input
        }});
        login(newForm, (data) => {
          const { room } = data;
          // CONECTION TO CHAT
          console.log("OPEN ROOM", room);
        });
      } else {
        dispatch({ type: "CONSOLESCREEN", payload: {
          error: true,
          command: code,
          response: ["Icorrect format"]
        }});
      }
    } else {
      dispatch({ type: "CONSOLESCREEN", payload: {
        prefix: user.email,
        command: code
      }});
    }
  }

  useEffect(() => {
    if (PROCESS[process.step]) {
      dispatch({
        type: "CONSOLESCREEN",
        payload: {
          prefix: "",
          command: PROCESS[process.step].output
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ process.step ]);

  return (
    <div className="terminal-container">
      <Terminal logic={handleSubmit} prefix={prefix} />
    </div>
  )
}
