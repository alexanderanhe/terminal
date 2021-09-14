import React, { useEffect, useState } from 'react';
import Terminal from './components/terminal'
import { collection, getDocs } from '@firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { db } from './firebase/firebaseConfig';
import './App.css';
import { addDoc } from 'firebase/firestore';

export default function App() {
  const tree = {
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

  const [ messages , setMessages ] = useState(null);

  const logic = (cmd) => {
    if (cmd === "hello") {
      return [
        "───▄▄▄▄▄▄",
        "─▄▀░░░░░░▀▄░██░██ █████ ██░░ ██░░ █████",
        "▐░▄▄▄░░▐▀▌░▌██▄██ ██▄▄▄ ██░░ ██░░ ██░██",
        "▐░░░░░░░░░░▌██▀██ ██▀▀▀ ██░░ ██░░ ██░██",
        "▐░░▀▄░░▄▀░░▌██░██ █████ ████ ████ █████",
        "─▀▄░░▀▀░░▄▀",
        "───▀▀▀▀▀▀---"
      ];
    }  else if (cmd === "game") {
      return [
        "        _=====_                               _=====_",
        "       / _____ \\                             / _____ \\",
        "     +.-'_____'-.---------------------------.-'_____'-.+",
        "    /   |     |  '.        S O N Y        .'  |  _  |   \\",
        "   / ___| /|\\ |___ \\                     / ___| /_\\ |___ \\",
        "  / |      |      | ;  __           _   ; | _         _ | ;",
        "  | | <---   ---> | | |__|         |_:> | ||_|       (_)| |",
        "  | |___   |   ___| ;SELECT       START ; |___       ___| ;",
        "  |\\    | \\|/ |    /  _     ___      _   \\    | (X) |    /|",
        "  | \\   |_____|  .','\" \"', |___|  ,'\" \"', '.  |_____|  .' |",
        "  |  '-.______.-' /       \\ANALOG/       \\  '-._____.-'   |",
        "  |               |       |------|       |                |",
        "  |              /\\       /      \\       /\\               |",
        "  |             /  '.___.'        '.___.'  \\              |",
        "  |            /                            \\             |",
        "   \\          /                              \\           /",
        "    \\________/                                \\_________/",
        "                      PS2 CONTROLLER"
      ];
    } else if (cmd === "art") {
      return [
        "            _               _    ____   ____ ___ ___",
        "  __ _ _ __| |_  ____      /_\\  / ___| / ___|_ _|_ _|",
        " / _  |  __| __|/ __ \\    //_\\\\ \\___ \\| |    | | | |",
        "| (_| | |  | |_|  ___/   / ___ \\ ___) | |___ | | | |",
        " \\__,_|_|   \\__|\\____>  /_/   \\_\\____/ \\____|___|___|",
      ];
    } else if (cmd === "chat") {
      return [
      "  ______ _     _                                    ___      ",
      "  / _____) |   (_)                                  / __)     ",
      " | /     | | _  _  ___ ____   ___   ____  ____ ____| |__ ___  ",
      " | |     | || \\| |/___)    \\ / _ \\ / _  |/ ___) _  |  __) _ \\ ",
      " | \\_____| | | | |___ | | | | |_| ( ( | | |  ( ( | | | | |_| |",
      "  \\______)_| |_|_(___/|_|_|_|\\___/ \\_|| |_|   \\_||_|_|  \\___/ ",
      "                                  (_____|                    ",
      "\n",
      "\n",
      "Pon tu nombre de usuario:"
      ];
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
            setMessages({ command: cmd, response: [ user.displayName, user.email ] });
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
            setMessages({ command: cmd, error: true, response: [errorMessage] });
          });
      }
      signInGoogle();
    } else if (cmd === "getData") {
      const getData = async() => {
        try {
          const data = await getDocs(collection(db, 'users'));
          const res = data.docs;
          setMessages({ command: cmd, response: res.map((e) => e.data().name) });
        } catch(err) {
          setMessages({ command: cmd, error: true, response: [err.message] });
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
          setMessages({ command: cmd, response: [ `Added user with reference ${docRef.id}` ] });
        } catch(err) {
          setMessages({ command: cmd, error: true, response: [err.message] });
        }
      })();
    } else {
      return false;
    }
  }

  useEffect(() => {
    
  }, []);
  return (
    <Terminal logic={logic} tree={tree} messages={messages}/>
  );
}
