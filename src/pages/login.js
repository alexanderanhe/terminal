import React, { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal';
import { SnapshotMetadata } from 'firebase/firestore';

const PROCESS = [
  {
    output: ["Type your email/username:"],
    input: "username"
  },
  {
    output: ["Type you password:"],
    input: "password"
  },
];

const TREESAMPLE = {
  "home": {
    "www": {
      "about_me.txt": [
        "Hola que hace"
      ]
    }
  },
  "root": {
    "nobody.txt": [
      "Que buscas si no hay nada",
      "Puto el que lo lea"
    ]
  }
};

export default function Login() {
  const [ { ascii }, dispatch ] = useAppContext();
  const [process, setProcess] = useState({
    type: null,
    step: 0,
    form: {}
  });

  const handleSubmit = ({ code }) => {
    const { type, step } = process;
    if (type === "email") {
      const input = code.replace(/\s+/g, "");
      if (step < PROCESS.length - 1) {
        setProcess({
          ...process,
          step: step + 1,
          form: {
            ...process.form,
            [PROCESS[step].input]: input
          }
        });
        dispatch({ type: "CONSOLESCREEN", payload: {
          command: input
        }});
      } else {
        const { username, password } = process.form;
        dispatch({
          type: "LOGIN",
          payload: {
            user: { username, password },
            uid: 123,
            userTree: TREESAMPLE
          }
        });
        console.log("LOGIN SUBMITED");
      }
    } else if (code === "auth email") {
      setProcess({
        ...process,
        type: "email"
      });
      dispatch({ type: "CONSOLESCREEN", payload: {
        command: code
      }});
    } else if (code === "auth google") {
      (async () => {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        const auth = getAuth();
        auth.languageCode = 'en';
        signInWithPopup(auth, provider)
          .then((result) => {
            // This gives you a Google Access Token. You can use it to access the Google API.
            const credential = GoogleAuthProvider.credentialFromResult(result);
            // The signed-in user info.
            const {
              displayName,
              email,
              emailVerified,
              isAnonymous,
              photoURL,
              metadata
            } = result.user;
            dispatch({
              type: "LOGIN",
              payload: {
                user: {
                  displayName,
                  email,
                  emailVerified,
                  isAnonymous,
                  photoURL,
                  createdAt: metadata.createdAt
                },
                uid: credential.uid,
                userTree: TREESAMPLE
              }
            });
          }).catch((error) => {
            // Handle Errors here.
            // eslint-disable-next-line no-unused-vars
            const { errorCode, errorMessage, email } = error.message;
            // The AuthCredential type that was used.
            // eslint-disable-next-line no-unused-vars
            const credential = GoogleAuthProvider.credentialFromError(error);
            // ...
            dispatch({ type: "CONSOLESCREEN", payload: { command: code, error: true, response: [errorMessage] } });
          });
      })();
    } else {
      dispatch({ type: "CONSOLESCREEN", payload: { command: code, error: true, response: [`Command "${code}" not found`] } });
    }
  };

  useEffect(() => {
    dispatch({
      type: "CONSOLESCREEN",
      payload: {
        response: ascii["hello"],
        block: true
      }
    });
    dispatch({
      type: "CONSOLESCREEN",
      payload: {
        command: "Hello and welcome! type an authentication or registration form to get started\n(ex. 'auth google')",
        response: [
          "\nauth",
          "\tgoogle\tGoogle Authentication (PopUp)",
          "\temail\t\tEmail authentication [-u | --username] [-p | --password]",
          "\nregister\t\tClassic email registration",
          "\n\n"
        ]
      }
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (process.type && PROCESS[process.step]) {
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

  return (
    <div className="terminal-container">
      <Terminal logic={handleSubmit}/>
    </div>
  )
}
