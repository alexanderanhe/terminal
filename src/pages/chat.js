import React, { useEffect, useState } from 'react';
// import { getAuth } from "firebase/auth";
// import { collection, getDocs, addDoc } from 'firebase/firestore';

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal'
import { SocketProvider, useSocket } from '../context/SocketContext';
// import { db } from '../firebase/FirebaseConfig';

const PROCESS = [
  {
    output: ["Type roomId:"],
    input: "room",
    regex: /^[A-Za-z0-9]{6}$/i
  },
];


export default function Chat() {
  // eslint-disable-next-line no-unused-vars
  const [{ uid, user, ascii, lang }, dispatch] = useAppContext();
  const [prefix, setPrefix] = useState("");
  const [process, setProcess] = useState({
    type: null,
    step: 0,
    form: {}
  });
  const socket = useSocket();

  const newRoom = () => Math.random().toString(36).slice(-8).toUpperCase();

  const login = (form, callback) => {
    const keys = PROCESS.map((process) => process.input);
    const formKeys = Object.keys(form).filter((field) => form[field]);
    const intersection = keys.filter((key) => formKeys.includes(key));
    if (intersection.length === PROCESS.length) {
      callback(form);
    }
  };

  const connect = (room) => {
    setPrefix(user.email);
    dispatch({ type: "CONSOLESCREEN", payload: {
      response: [`Conected to room ${room}`]
    }});
  };

  const send = ({message}) => {
    // logic to send messages
    socket?.emit("message", {
      text: message,
      user: user.email
    });
    dispatch({ type: "CONSOLESCREEN", payload: {
      prefix: user.email,
      command: message
    }});
  }

  const handleSubmit = ({ code }) => {
    const { step, form, type } = process;
    if (form.room) {
      send({
        message: code
      })
    } else if (type === "join") {
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
            connect(room);
          });
        } else {
          dispatch({ type: "CONSOLESCREEN", payload: {
            error: true,
            command: code,
            response: ["Icorrect format"]
          }});
        }
      }
    } else if (code === "join") {
      setProcess({
        ...process,
        type: "join"
      });
    } else if (code === "new") {
      const nRoom = newRoom();
      setProcess({
        ...process,
        type: "new",
        form: {
          ...process.form,
          room: nRoom
        }
      });
      connect(nRoom);
    } else {
      dispatch({ type: "CONSOLESCREEN", payload: { command: code, error: true, response: [`Command "${code}" not found`] } });
    }
  }

  useEffect(() => {
    dispatch({ type: "CONSOLESCREEN", payload: {
      response: ascii["chat"],
      block: true
    }});
  }, []);

  useEffect(() => {
    if (process.type === "join" && PROCESS[process.step]) {
      dispatch({
        type: "CONSOLESCREEN",
        payload: {
          prefix: "",
          command: PROCESS[process.step].output
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ process.type, process.step ]);

  useEffect(() => {
    if (socket == null) return

    socket.on('receive', ({ text, sender}) => {
      dispatch({ type: "CONSOLESCREEN", payload: {
        prefix: sender,
        command: text
      }});
    })
    return () => socket.off('receive')
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ socket ])

  return (
    <SocketProvider id={uid}>
      <div className="terminal-container">
        <Terminal logic={handleSubmit} prefix={prefix} />
      </div>
    </SocketProvider>
  )
}
