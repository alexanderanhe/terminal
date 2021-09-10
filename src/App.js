import React, { useState } from 'react';
import Terminal from './components/terminal'
import './App.css';

export default function App() {
  const [prefix, setPrefix] = useState("");

  const tree = {
    "home": {
      "www": {
        "about_me.txt": "Hola que hace"
      }
    },
    "root": {
      "nobody.txt": ""
    }
  };

  const nav = (path = "") => {
    const realPath = path ? path : prefix;
    let result = { ...tree };
    console.log(realPath);
    if (realPath) {
      try {
        realPath.split("/").forEach((dir) => {
          if (dir) {
            if (typeof result[dir] === "object") {
              result = result[dir];
            } else {
              console.error(dir);
              throw {};
            }
          }
        });
      } catch (e) {
        return false;
      }
    }
    return result;
  }

  const navigate = (param) => {
    const back = param === ".." ? 1 : 0;
    const path = `${prefix.substring(0,prefix.length - back)}${!back ? param : ""}`;
    const pieces = path.split("/").filter((p) => p);
    const realPath = pieces.slice(0, pieces.length - back);
    const location = nav(realPath);
    if (!location) {
      setPrefix(`${realPath.join("/")}${realPath.length ? "/" : ""}`);
      return [];
    }
    return false;
  }
  const explore = () => {
    const location = nav();
    return location ? Object.keys(location) : location;
  };
  const readFile = (file) => {
    const location = nav();
    if (typeof location[file] === "string") {
      return [location[file]];
    }
    return false;
  };

  const logic = (cmd) => {
    if (cmd === "cmd") {
      return [ "ls", "cat", "clear", "cd", "cmd" ];
    } else if (cmd === "hola") {
      return ["Hola pedazo de salchicha"];
    } else if (/^cd (\w+|\.\.|\/)*/gi.test(cmd)) {
      // const pieces = cmd.match(/^cd/);
      const param = cmd.substring(3, cmd.length).replace(/\s+/g, "");
      return navigate(param);
    } else if (/^ls(\w+|\.\.|\/)*/gi.test(cmd)) {
      return explore();
    } else if (/^cat (\w+|\.\.|\/)*/gi.test(cmd)) {
      const file = cmd.substring(4, cmd.length).replace(/\s+/g, "");
      return readFile(file);
    } else {
      return false;
    }
  }
  return (
    <Terminal logic={logic} prefix={prefix}/>
  );
}
