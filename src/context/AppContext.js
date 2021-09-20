import React, { createContext, useContext, useReducer } from "react";
import Reducer from "./reducer";
import getASCII from "../helpers/ascii";
import useLocalStorage from "../hooks/localStorage";

const AppContext = createContext([[],() => {}]);

export function AppContextProvider({ children }) {
  const ascii = getASCII();
  const [ user ] = useLocalStorage("user", {});
  const [ uid ] = useLocalStorage("uid", null);
  const [ lang ] = useLocalStorage("lang", "es");
  const [ userTree ] = useLocalStorage("userTree", "es");
  const initialState = {
    ascii,
    lang,
    user,
    uid,
    userTree,
    consoleScreen: [],
    isLoading: false
  };

  return (
    <AppContext.Provider value={useReducer(Reducer, initialState)}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
