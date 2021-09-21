import React, { Fragment, useState, useRef, useEffect } from 'react';

import { useAppContext } from '../../context/AppContext';
import useLocalStorage from '../../hooks/localStorage';
import linuxBasic, { linuxBasicKeyDown } from './Terminal.functions';

import './Terminal.scss';

const Loader = ({ message }) => (
  <div className="loader">
    <div className="loader__spinner" />
    <p className="loader__text">{message}</p>
  </div>
);

export default function Terminal({ logic, prefix, setPrefix, userTree }) {
  const [{ consoleScreen, user, isLoading }, dispatch] = useAppContext();
  const input = useRef(null);
  const inputBox = useRef(null);
  // const [code, setCode] = useState("");
  const [history, setHistory] = useLocalStorage('history', []);
  // const [cursor, setCursor] = useState(0);
  // const [focus, setFocus] = useState(true);
  // const [consoleScreen, setConsoleScreen] = useState([
  //   {prefix: "", command: `Hey there! Typing "cmd" for help`}
  // ]);
  const [tools, setTools] = useState({
    cursor: 0,
    code: "",
    focus: true
  });


  const handleChange = (event) => {
    setTools({
      ...tools,
      code: (history[history.length - tools.cursor] || "") + event.target.value,
      cursor: 0
    });
  };
  const handleSubmit = (e) => {
    e.preventDefault();
    const { code } = tools;
    if (!code) return;
    const output = linuxBasic({
      code, history, prefix, userTree, user
    });
    if (output) {
      if (setPrefix) {
        setPrefix(output?.payload?._prefix || prefix);
      }
      dispatch({...output});
    } else {
      logic({ code });
    }
    setHistory([...history, code]);
    setTools({
      ...tools,
      code: "",
      cursor: 0
    });
  };
  const handleFocus = () => {
    if (input.current) {
      input.current.focus();
    }
  };
 
  const handleKeyDown = (event) => {
    const { code, cursor } = tools;
    const output = linuxBasicKeyDown({
      event, code, cursor, history, prefix, userTree
    });
    setTools({ ...tools, ...output });
  }

  useEffect(() => {
    if (input.current) {
      setTools({ ...tools, focus: true });
      input.current.focus();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tools.code) {
      inputBox.current.scrollTo({
        top: inputBox.current.firstElementChild.clientHeight,
        left: 0,
        behavior: 'smooth'
      });
    }
  }, [tools.code, consoleScreen]);

  return (
    <>
      { isLoading && <Loader message={isLoading} /> }
      <div className="terminal" onClick={handleFocus} ref={inputBox}>
        <form onSubmit={handleSubmit}>
          <>
          {consoleScreen?.map((cmd, j) => (
            <Fragment key={`${cmd}-${j}`}>
              {cmd.command && (
                <p className="prompt" data-prefix={`${cmd.prefix || ""}> `} style={cmd.style}>{cmd.command}</p>
              )}
              <ul className={`${cmd.error ? "error" : ""} ${cmd.block ? "block" : ""}`}>
                {cmd.response && cmd.response?.map((line, i) => (
                  <li key={`${line}-${i}`} style={cmd.style} className="result">{line}</li>
                ))}
              </ul>
            </Fragment>
          ))}
          </>
          <p className={"prompt output new-output" + (tools.focus ? " active" : "")}  data-prefix={`${prefix || ""}> `}>
            <input
              type="text"
              className="invisible"
              ref={input}
              onChange={handleChange}
              onKeyDown={handleKeyDown}
              onBlur={() => setTools({ ...tools, focus: false })}
              onFocus={() => setTools({ ...tools, focus: true })}
              value={tools.code}
            />
            <span>{history[history.length - tools.cursor] || ""}</span>
            {tools.code}
          </p>
        </form>
      </div>
    </>
  );
}
