import React, { useEffect, useState } from 'react';
// import { getAuth } from "firebase/auth";
// import { collection, getDocs, addDoc } from 'firebase/firestore';

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal/Terminal'
import { useSocket } from '../context/SocketContext';
import { useParams } from 'react-router';
// import { db } from '../firebase/FirebaseConfig';

import notif from '../notify.mp3';

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
  const [input, setInput] = useState("");
  const audio = new Audio(notif);
  
  const notify = () => {
    const playPromise = audio.play();
    audio.volume = 0.5;
    if (playPromise !== undefined) {
      playPromise
        .then(_ => {
          // Automatic playback started!
          // Show playing UI.
          console.log("audio played auto");
        })
        .catch(error => {
          // Auto-play was prevented
          // Show paused UI.
          console.log("playback prevented");
        });
    }
  }

  const newRoom = () => Math.random().toString(36).slice(-6).toUpperCase();

  const onHandleChange = (code) => setInput(code);

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

  const send = ({ message }) => {
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
  };

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
  }, [room]);

  useEffect(() => {
    if (socket == null || !process.form.room) return;
    socket.emit("joinRoom", process.form.room);
  }, [ socket, process.form.room ])

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
        prefix: email || displayName,
        command: message,
        style: { color: textColor || "#FFF" }
      };
    };

    socket.on("receive", ({ message, sender}) => {
      dispatch({ type: "CONSOLESCREEN", payload: messageFormat({message, sender})});
      notify();
    });

    socket.on("history", (messages) => {
      if (messages) {
        const messageArr = JSON.parse(messages);
        const payload = messageArr.map(({ message, sender}) => messageFormat({ message, sender}));
        dispatch({ type: "CONSOLESCREEN", payload });
      }
    });

    socket.on("userjoinroom", (user) => {
      dispatch({
        type: "CONSOLESCREEN",
        payload: {
          command: `${user.email || user.displayName} has joined`,
          style: { color: "#37b4e9"},
          prefix: ">>>>>>>>>"
        }
      });
      notify();
    });

    socket.on("usertyping", (user) => {
      dispatch({
        type: "STATE_MESSAGE",
        payload: `${user.email || user.displayName} is typing`
      });
    });
    
    socket.on("userstoppedtyping", (user) => {
      dispatch({ type: "CLEAR_STATE_MESSAGE" });
    });

    return () => {
      socket.off("receive");
      socket.off("history");
      socket.off("userjoinroom");
      socket.off("usertyping");
      socket.off("userstoppedtyping");
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ socket ]);

  useEffect(() => {
    if (!process.form?.room) return;
    if (input) {
      socket?.emit("typing", process.form?.room);
    } else {
      socket?.emit("stoppedTyping", process.form?.room);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [input])

  return (
    <Terminal logic={handleSubmit} prefix={prefix} onHandleChange={onHandleChange} />
  )
}
