import React, { useState, useRef, useEffect } from 'react';
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

export default function Terminal({ logic, prefix: customPrefix }) {
  const input = useRef();
  const [code, setCode] = useState("");
  const [history, setHistory] = useLocalStorage('history', []);
  const [cursor, setCursor] = useState(0);
  const [focus, setFocus] = useState(true);
  const [consoleScreen, setConsoleScreen] = useState([
    {prefix: "", command: "Hey there! Typing cmd for help"}
  ]);
  const [prefix, setPrefix] = useState("");

  const handleChange = (e) => {
    setCode((history[history.length - cursor] || "") + e.target.value)
    setCursor(0);
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    if (!code) return;
    if (code.toLowerCase() === "clear") {
      setConsoleScreen([]);
    } else if (typeof logic === 'function'){
      const response = logic(code);
      if (Array.isArray(response)) {
        setConsoleScreen([ ...consoleScreen, { prefix, command: code, response }]);
      } if (response === false) {
        setConsoleScreen([ ...consoleScreen, { prefix, command: code, error: true, response: [`Command "${code}" not found`] }]);
      }
    }
    setHistory([...history, code])
    setCode("");
    setCursor(0);
  };
  const handleFocus = () => {
    if (input.current) {
      input.current.focus();
    }
  };
  const handleKeyDown = (e) => {
    // console.log(e.keyCode);
    if (e.keyCode === 8 && cursor > 0) {
      setCursor(0);
      setCode("");
    } else if ((e.keyCode === 9 || e.keyCode === 13) && cursor) {
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
    setPrefix(typeof customPrefix !== "undefined" ? customPrefix : "");
  }, [customPrefix, prefix]);

  useEffect(() => {
    if (input.current) {
      setFocus(true);
      input.current.focus();
    }
  }, []);

  return (
    <div className="terminal" onClick={handleFocus}>
      <form onSubmit={handleSubmit}>
        <>
        {consoleScreen.map((cmd, j) => (
          <>
          <p className="prompt" data-prefix={`${cmd.prefix}> `}>{cmd.command}</p>
          <ul className={`${cmd.error ? "error" : ""}`}>
            {cmd.response && cmd.response?.map((line) => (
              <li key={`${j}${line}`} className="result">{line}</li>
            ))}
          </ul>
          </>
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