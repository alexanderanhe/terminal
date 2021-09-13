import React, { useEffect } from 'react';
import Terminal from './components/terminal'
import { collection, getDocs } from '@firebase/firestore';
import db from './firebase/firebaseConfig';
import './App.css';

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
    } else {
      return false;
    }
  }

  useEffect(() => {
    const getData = async() => {
      const data = await getDocs(collection(db, 'users'));
      console.log(data);
    };
    getData();
  }, []);
  return (
    <Terminal logic={logic} tree={tree}/>
  );
}
