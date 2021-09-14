const DEFAULT_IMAGE = "https://webservicesnt.org/apis/epasero/cosmetics/images/user_perfil.svg";

export default function Reducer(state, action) {
  switch (action.type) {
    case "LOGIN":
      const { uid, user, userTree } = action.payload;
      console.log(uid, user);
      // JSON.stringify(defaultUser);
      // localStorage.setItem("uid", act);
      return {
        ...state,
        user,
        uid,
        userTree,
        consoleScreen: [{prefix: "", command: "AUTHENTICATED" }]
      };
    // case "CHANGE_ONBOARDING":
    //   return {
    //     ...state,
    //     onboarding: action.payload
    //   };
    // case "LOGOUT":
    //   localStorage.removeItem("user");
    //   localStorage.removeItem("sessionId");
    //   return {
    //     ...state,
    //     user: {},
    //     sessionId: null
    //   };
    // case "CHANGEIMAGE":
    //   const newUser = { ...state.user, profileImage: `${action.payload}?${Math.floor(Math.random() * 100) + 1}` };
    //   localStorage.setItem("user", JSON.stringify(newUser));
    //   return {
    //     ...state,
    //     user: newUser
    //   };
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
    case "CREARCONSOLESCREEN":
      return {
        ...state,
        consoleScreen: []
      };
    default:
      return state;
  }
}
