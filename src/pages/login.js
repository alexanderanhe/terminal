import React, { useEffect, useState } from 'react';
import { getAuth, signInWithPopup, GoogleAuthProvider, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";

import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal';

const PROCESS = [
  {
    output: ["Type your email:"],
    input: "email",
    regex: /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    regexMessage: "Incorrect email"
  },
  {
    output: ["Type you password:"],
    input: "password",
    regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/,
    regexMessage: "The password must contain at least one uppercase, one lowercase, a number and must be greater than 8 characters"
    // regex: /^(((?=.*[a-z])(?=.*[A-Z]))|((?=.*[a-z])(?=.*[0-9]))|((?=.*[A-Z])(?=.*[0-9])))(?=.{6,})/ // passwordMedium
    // regex: /^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/ // passwordStrength 
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
  const [ { ascii, lang }, dispatch ] = useAppContext();
  const [process, setProcess] = useState({
    type: null,
    step: 0,
    form: {}
  });

  const login = (form, callback) => {
    const keys = PROCESS.map((process) => process.input);
    const formKeys = Object.keys(form).filter((field) => form[field]);
    const intersection = keys.filter((key) => formKeys.includes(key));
    if (intersection.length === PROCESS.length) {
      // CONECTION TO CHAT
      callback(form);
    }
  };

  const handleSubmit = ({ code }) => {
    const { type, step, form } = process;
    if (["signInEmail", "registerEmail"].indexOf(type) !== -1) {
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
            const { email, password } = data;
            console.log(email, password);
            const auth = getAuth();
            const responseManage = (promise) => {
              promise.then((userCredential) => {
                // Signed in
                const user = userCredential.user;
                console.log(user);
                // ...
                dispatch({
                  type: "LOGIN",
                  payload: {
                    user: { 
                      displayName: null,
                      email,
                      emailVerified: false,
                      isAnonymous: true,
                      photoURL: null,
                      createdAt: null
                    },
                    uid: 123,
                    userTree: TREESAMPLE
                  }
                });
              })
              .catch((error) => {
                // Handle Errors here.
                // eslint-disable-next-line no-unused-vars
                const { code: errorCode, message: errorMessage } = error;
                // The AuthCredential type that was used.
                // eslint-disable-next-line no-unused-vars
                const credential = GoogleAuthProvider.credentialFromError(error);
                console.log(credential);
                // ...
                dispatch({ type: "CONSOLESCREEN", payload: { command: "", error: true, response: [`${errorMessage}`] } });
                setProcess({ ...process, type: null, step: 0, form: {}});
              });
            };
            if (type === "signInEmail") {
              responseManage(signInWithEmailAndPassword(auth, email, password));
            } else if (type === "registerEmail") {
              responseManage(createUserWithEmailAndPassword(auth, email, password));
            }
          });
        } else {
          dispatch({ type: "CONSOLESCREEN", payload: {
            error: true,
            command: code,
            response: ["Icorrect format"]
          }});
        }
      }
    } else if (code === "auth email") {
      setProcess({
        ...process,
        type: "signInEmail"
      });
      dispatch({ type: "CONSOLESCREEN", payload: {
        command: code
      }});
    } else if (code === "register") {
      setProcess({
        ...process,
        type: "registerEmail"
      });
      dispatch({ type: "CONSOLESCREEN", payload: {
        command: code
      }});
    } else if (code === "auth google") {
      (async () => {
        const provider = new GoogleAuthProvider();
        provider.addScope('https://www.googleapis.com/auth/contacts.readonly');
        const auth = getAuth();
        auth.languageCode = lang;
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
                uid: credential.accessToken,
                userTree: TREESAMPLE
              }
            });
          }).catch((error) => {
            // Handle Errors here.
            // eslint-disable-next-line no-unused-vars
            const { code: errorCode, message: errorMessage } = error;
            // The AuthCredential type that was used.
            dispatch({ type: "CONSOLESCREEN", payload: { command: code, error: true, response: [`${errorMessage}`] } });
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
    if (["signInEmail", "registerEmail"].indexOf(process.type) !== -1 && PROCESS[process.step]) {
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
