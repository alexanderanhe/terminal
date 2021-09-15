import React, { createContext, useContext, useReducer } from "react";
import Reducer from "./reducer";
import getASCII from "../helpers/ascii";

const AppContext = createContext([[],() => {}]);

export function AppContextProvider({ children }) {
  const ascii = getASCII();
  const initialState = {
    ascii,
    lang: "es",
    user: {},
    uid: null,
    consoleScreen: [],
    userTree: {}
  };

  return (
    <AppContext.Provider value={useReducer(Reducer, initialState)}>
      {children}
    </AppContext.Provider>
  );
}

export const useAppContext = () => useContext(AppContext);
