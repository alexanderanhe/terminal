import React, { useEffect, useState, useCallback } from 'react';
// import { getAuth } from "firebase/auth";
// import { collection, getDocs, addDoc } from 'firebase/firestore';

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal'
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router';
// import { db } from '../firebase/FirebaseConfig';

const PROCESS = [
  {
    output: ["Type roomId:"],
    input: "room",
    regex: /^[A-Za-z0-9]{6}$/i
  },
];


export default function Chat({ history }) {
  // eslint-disable-next-line no-unused-vars
  const [{ uid, user, ascii, lang }, dispatch] = useAppContext();
  const [prefix, setPrefix] = useState("chat");
  const [process, setProcess] = useState({
    type: null,
    step: 0,
    form: {}
  });
  const socket = useSocket();
  const { room } = useParams();

  const newRoom = () => Math.random().toString(36).slice(-6).toUpperCase();

  const login = (form, callback) => {
    const keys = PROCESS.map((process) => process.input);
    const formKeys = Object.keys(form).filter((field) => form[field]);
    const intersection = keys.filter((key) => formKeys.includes(key));
    if (intersection.length === PROCESS.length) {
      callback(form);
    }
  };

  const connect = useCallback((room) => {
    setPrefix(user.email);
    socket?.emit("joinRoom", room);
    dispatch({ type: "CONSOLESCREEN", payload: {
      response: [`Conected to room ${room}`]
    }});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ socket ]);

  const send = useCallback(({ message }) => {
    // logic to send messages
    const { room } = process.form;
    socket?.emit("message", {
      message,
      room
    });
    dispatch({ type: "CONSOLESCREEN", payload: {
      prefix: user.email,
      command: message,
      style: { color: "#FFFFFF" }
    }});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ socket ]);

  const handleSubmit = ({ code }) => {
    const { step, form, type } = process;
    if (code.toLowerCase().replace(/\s+/g, "") === "exit") {
      dispatch({ type: "CLEARCONSOLESCREEN" });
      history.push('/');
    } else if (form.room) {
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
      history.push(`/chat/${newRoom()}`);
    } else {
      dispatch({ type: "CONSOLESCREEN", payload: { command: code, error: true, response: [`Command "${code}" not found`] } });
    }
  }

  useEffect(() => {
    dispatch({ type: "CONSOLESCREEN", payload: {
      response: ascii["chat"],
      block: true
    }});
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (room === "new") {
      history.push(`/chat/${newRoom()}`);
    } if (/^[A-Za-z0-9]{6}$/i.test(room)) {
      const newForm = {
        ...process.form,
        room: room.toUpperCase()
      };
      setProcess({
        ...process,
        type: "connect",
        form: newForm
      });
      login(newForm, (data) => {
        const { room } = data;
        connect(room);
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [room])

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

    const messageFormat = ({ message, sender}) => {
      const { displayName, email, textColor } = JSON.parse(sender);
      return {
        prefix: displayName || email,
        command: message,
        style: { color: textColor || "#FFF" }
      };
    };

    socket.on("receive", ({ message, sender}) => {
      dispatch({ type: "CONSOLESCREEN", payload: messageFormat({message, sender})});
    });

    socket.on("history", (messages) => {
      if (messages) {
        const messageArr = JSON.parse(messages);
        const payload = messageArr.map(({ message, sender}) => messageFormat({ message, sender}));
        dispatch({ type: "CONSOLESCREEN", payload });
      }
    });
    return () => {
      socket.off("receive");
      socket.off("history");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ socket ]);

  return (
    <Terminal logic={handleSubmit} prefix={prefix} />
  )
}
