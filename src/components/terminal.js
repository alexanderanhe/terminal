import React, { Fragment, useState, useRef, useEffect } from 'react';
import './terminal.css';

const PREFIX = 'terminal-'

function useLocalStorage(key, initialValue) {
  const prefixedKey = PREFIX + key;
  const [value, setValue] = useState(() => {
    const jsonValue = localStorage.getItem(prefixedKey);
    if (jsonValue != null) return JSON.parse(jsonValue)
    if (typeof initialValue === 'function') {
      return initialValue();
    } else {
      return initialValue;
    }
  })

  useEffect(() => {
    localStorage.setItem(prefixedKey, JSON.stringify(value))
  }, [prefixedKey, value])

  return [value, setValue];
}

export default function Terminal({ logic, tree }) {
  const input = useRef(null);
  const inputBox = useRef(null);
  const [code, setCode] = useState("");
  const [history, setHistory] = useLocalStorage('history', []);
  const [cursor, setCursor] = useState(0);
  const [focus, setFocus] = useState(true);
  const [consoleScreen, setConsoleScreen] = useState([
    {prefix: "", command: `Hey there! Typing "cmd" for help`}
  ]);
  const [prefix, setPrefix] = useState("");

  const nav = (path = "", files = false) => {
    const realPath = path ? path : prefix;
    let result = { ...tree };
    if (realPath) {
      try {
        realPath.split("/").forEach((dir) => {
          if (dir) {
            if (typeof result[dir] === "object" && (Array.isArray(result[dir]) || !files)) {
              result = result[dir];
            } else {
              console.error(`The directory "${dir}" was not found`);
              throw new Error("error");
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
    const location = nav(realPath.join("/"));
    if (location && !Array.isArray(location) && typeof location !== "string") {
      const newPrefix = `${realPath.join("/")}${realPath.length ? "/" : ""}`;
      setPrefix(newPrefix);
      setConsoleScreen([ ...consoleScreen, { prefix: newPrefix, command: code, response: [] }]);
      return;
    }
    setConsoleScreen([ ...consoleScreen, { prefix, command: code, error: true, response: [`The directory "${param}" was not found`] }]);
  };
  const explore = (parameters) => {
    const location = nav();
    if (location) {
      const param = (p) => [...parameters].indexOf(p) >= 0;
      const response = Object.keys(location).map((file, i) => [
        `${param("i") ? `${i}\t` : ""}`,
        `${param("l") ? `${Array.isArray(location[file]) ? "-a----" : "d-----"}\t` : ""}`,
        `${param("l") ? `${Array.isArray(location[file]) ? location[file].length : ""}\t` : ""}`,
        file
      ].join(""));
      setConsoleScreen([ ...consoleScreen, { prefix, command: code, response }]);
      return;
    }
    setConsoleScreen([ ...consoleScreen, { prefix, command: code, error: true, response: [`Command "${code}" not found`] }]);
  };
  const readFile = (file) => {
    const location = nav();
    if (Array.isArray(location[file]) || typeof location[file] === "string") {
      const lines = Array.isArray(location[file]) ? location[file] : [location[file]];
      setConsoleScreen([ ...consoleScreen, { prefix, command: code, response: lines }]);
      return;
    }
    const errorMessage = location[file] ? `"${file}" is not a file` : `"${file}" doesn't exist`;
    setConsoleScreen([ ...consoleScreen, { prefix, command: code, error: true, response: [errorMessage] }]);
  };
  const handleChange = (e) => {
    setCode((history[history.length - cursor] || "") + e.target.value)
    setCursor(0);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code) return;
    if (code.toLowerCase().replace(/\s+/g, "") === "cmd") {
      setConsoleScreen([ ...consoleScreen, { prefix, command: code, response: [ "ls", "cat", "clear", "cd", "cmd" ] }]);
    } else if (code.toLowerCase().replace(/\s+/g, "") === "clear") {
      setConsoleScreen([]);
    } else if (code.toLowerCase().replace(/\s+/g, "") === "reboot") {
      window.location.reload();
    } else if (/^history(\d+)*/gi.test(code)) {
      const param = code.substring(8, code.length).replace(/\s+/g, "");
      const count = param ? parseInt(param, 10) : history.length;
      setConsoleScreen([ ...consoleScreen, { prefix, command: code, response: history.reverse().slice(0, count) }]);
    } else if (/^cd (\w+|\.\.|\/)*/gi.test(code)) {
      const param = code.substring(3, code.length).replace(/\s+/g, "");
      navigate(param);
    } else if (/^[ls|ll](\w+|\.\.|\/)*/gi.test(code)) {
      const param = code.substring(2, code.length).replace(/\s+/g, "");
      explore(param);
    } else if (/^cat (\w+|\.\.|\/)*/gi.test(code)) {
      const file = code.substring(4, code.length).replace(/\s+/g, "");
      readFile(file);
    } else if (typeof logic === 'function'){
      const response = logic(code);
      if (Array.isArray(response) || typeof response === "string") {
        const lines = Array.isArray(response) ? response : [response];
        setConsoleScreen([ ...consoleScreen, { prefix, command: code, response: lines }]);
      } if (response === false) {
        setConsoleScreen([ ...consoleScreen, { prefix, command: code, error: true, response: [`Command "${code}" not found`] }]);
      }
    }
    setHistory([...history, code]);
    setCode("");
    setCursor(0);
  };
  const handleFocus = () => {
    if (input.current) {
      input.current.focus();
    }
  };
  const help = (param) => {
    const path = `${prefix}${param}`;
    const pieces = path.split("/").filter((p) => p);
    const realPath = pieces.slice(0, pieces.length - 1);
    const location = nav(realPath.join("/"));
    if (location) {
      const suggestion = Object.keys(location).filter((l) => l.search(param.split("/").slice(-1).pop()) === 0);
      if (suggestion.length === 1) {
        const params = param.split("/");
        const prePath = params.splice(0, params.length - 1).join("/");
        const prediction = suggestion.shift();
        return `${prePath}${prePath.length ? "/" : ""}${prediction}${Array.isArray(location[prediction]) || typeof location[prediction] === "string" ? "" : "/"}`;
      }
    }
  };
  const handleKeyDown = (e) => {
    if (e.keyCode === 8 && cursor) {
      setCursor(0);
      setCode("");
    } else if (e.keyCode === 9 && !cursor) {
      e.preventDefault();
      if (/^cd (\w+|\/)*/gi.test(code)) {
        const param = code.substring(3, code.length).replace(/\s+/g, "");
        const suggestion = help(param);
        setCode(`cd ${suggestion}`);
      } else if (/^cat (\w+|\/)*/gi.test(code)) {
        const param = code.substring(4, code.length).replace(/\s+/g, "");
        const suggestion = help(param);
        setCode(`cat ${suggestion}`);
      }
    } else if ((e.keyCode === 9 || e.keyCode === 13) && cursor) {
      e.preventDefault();
      setCode(history[history.length - cursor] || "");
      setCursor(0);
    } else
    // arrow up/down button should select next/previous list element
    if (e.keyCode === 38) {
      setCursor(cursor + 1 > history.length ? history.length : cursor + 1);
      setCode("");
    } else if (e.keyCode === 40) {
      setCursor(cursor - 1 < 0 ? 0 : cursor - 1);
      setCode("");
    }
  }

  useEffect(() => {
    if (input.current) {
      setFocus(true);
      input.current.focus();
    }
  }, []);

  useEffect(() => {
    if (!code) {
      inputBox.current.scrollTo({
        top: inputBox.current.firstElementChild.clientHeight,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [code])

  return (
    <div className="terminal" onClick={handleFocus} ref={inputBox}>
      <form onSubmit={handleSubmit}>
        <>
        {consoleScreen.map((cmd, j) => (
          <Fragment key={`${cmd}-${j}`}>
          <p className="prompt" data-prefix={`${cmd.prefix}> `}>{cmd.command}</p>
          <ul className={`${cmd.error ? "error" : ""}`}>
            {cmd.response && cmd.response?.map((line, i) => (
              <li key={`${line}-${i}`} className="result">{line}</li>
            ))}
          </ul>
          </Fragment>
        ))}
        </>
        <p className={"prompt output new-output" + (focus ? " active" : "")}  data-prefix={`${prefix}> `}>
          <input
            type="text"
            className="here"
            ref={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() =>setFocus(false)}
            onFocus={() => setFocus(true)}
            value={code}
          />
          <span>{history[history.length - cursor] || ""}</span>
          {code}
        </p>
      </form>
    </div>
  );
}