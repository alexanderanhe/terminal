import { PREFIX } from "../hooks/localStorage";

export default function Reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      const { uid, user: userData, userTree } = action.payload;
      const user = {
        displayName: userData.displayName,
        email: userData.email,
        emailVerified: userData.emailVerified,
        isAnonymous: userData.isAnonymous,
        photoURL: userData.photoURL,
        metadata: userData.metadata
      };
      localStorage.setItem(`${PREFIX}user`, JSON.stringify(user));
      localStorage.setItem(`${PREFIX}uid`, JSON.stringify(uid));
      localStorage.setItem(`${PREFIX}userTree`, JSON.stringify(userTree));
      return {
        ...state,
        user,
        uid,
        userTree,
        consoleScreen: [{ response: state.ascii["authenticated"], block: true }]
      };
    case "LOGOUT":
      localStorage.removeItem(`${PREFIX}user`);
      localStorage.removeItem(`${PREFIX}uid`);
      localStorage.removeItem(`${PREFIX}userTree`);
      return {
        ...state,
        user: {},
        uid: null
      };
    case "CHANGE_THEME":
      const themeValidation = state.theme === "clasic" ? "monitor" : "clasic";
        localStorage.setItem(`${PREFIX}theme`, JSON.stringify(themeValidation));
        return {
          ...state,
          theme: themeValidation
        };
    case "CHANGE_LANGUAGE":
      const langValidation = state.lang === "en" ? "es" : "en";
      localStorage.setItem(`${PREFIX}lang`, JSON.stringify(langValidation));
      return {
        ...state,
        lang: langValidation
      };
    case "UPDATEUSERTREE":
      return {
        ...state,
        userTree: action.payload
      };
    case "CONSOLESCREEN":
      const newConsoleScreen = Array.isArray(action.payload) ? [...action.payload] :
        [{ ...action.payload }];
      return {
        ...state,
        consoleScreen: [ ...state.consoleScreen, ...newConsoleScreen ]
      };
    case "CLEARCONSOLESCREEN":
      return {
        ...state,
        consoleScreen: []
      };
    case "LOADER":
      return {
        ...state,
        isLoading: action.payload
      };
    case "STATE_MESSAGE":
      return {
        ...state,
        stateMessage: action.payload
      };
    case "CLEAR_STATE_MESSAGE":
      return {
        ...state,
        stateMessage: ""
      };
    default:
      return state;
  }
}
