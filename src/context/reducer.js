import { PREFIX } from "../hooks/localStorage";

export default function Reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      const { uid, user, userTree } = action.payload;
      localStorage.setItem(`${PREFIX}user`, JSON.stringify(user));
      localStorage.setItem(`${PREFIX}uid`, JSON.stringify(uid));
      localStorage.setItem(`${PREFIX}userTree`, JSON.stringify(userTree));
      return {
        ...state,
        user,
        uid,
        userTree,
        consoleScreen: [{ response: state.ascii["hello"], block: true }]
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
    case "CHANGE_LANGUAGE":
      const langValidation = state.lang === "en" ? "es" : "en";
      localStorage.setItem("lang", JSON.stringify(langValidation));
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
      return {
        ...state,
        consoleScreen: [ ...state.consoleScreen, { ...action.payload }]
      };
    case "CLEARCONSOLESCREEN":
      return {
        ...state,
        consoleScreen: []
      };
    default:
      return state;
  }
}
