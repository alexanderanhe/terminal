import React, { useEffect, useState } from 'react';
import { useAppContext } from '../context/AppContext';
import Terminal from '../components/terminal';

const PROCESS = [
  {
    output: ["Type your email/username:"],
    input: "username"
  },
  {
    output: ["type you password:"],
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
  const [ {}, dispatch ] = useAppContext();
  const [process, setProcess] = useState({
    step: 0,
    form: {}
  });

  const handleSubmit = ({ code }) => {
    const step = process.step;
    const input = code.replace(/\s+/g, "");
    console.log(step,  PROCESS.length);
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
        prefix: "", command: input
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
  };

  // useEffect(() => {
  //   dispatch({
  //     type: "CONSOLESCREEN",
  //     payload: {
  //       prefix: "",
  //       command: PROCESS[process.step].output
  //     }
  //   });
  // // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  useEffect(() => {
    if (PROCESS[process.step]) {
      dispatch({
        type: "CONSOLESCREEN",
        payload: {
          prefix: "",
          command: PROCESS[process.step].output
        }
      });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ process.step ]);

  return (
    <div>
      {/* logic={logic} tree={tree} messages={messages} */}
      <Terminal logic={handleSubmit}/>
    </div>
  )
}
