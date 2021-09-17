import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client';
import { useAppContext } from '../context/AppContext';

const SocketContext = React.createContext(null);

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ id, children }) {
  const [socket, setSocket] = useState();
  // eslint-disable-next-line no-unused-vars
  const [{ uid, user }] = useAppContext();

  const getRandomColor = () => {
    const num=(Math.floor(Math.random()*4)*4).toString(16);
    const letters = ['0','F',num];
    let color = '#';
    
    for (var i = 0; i < 3; i++ ) {
        let pos=Math.floor(Math.random() * letters.length);
        color += letters[pos];
        letters.splice(pos,1);
    }

    // if(colores.includes(color))
    //   return getRandomColor();
    // else
    //   colores.push(color)

    return color;
  }  

  useEffect(() => {
    if (uid) {
      const textColor = getRandomColor();
      const userJson = JSON.stringify({...user, textColor});
      const socketio  = io(
        process.env.REACT_APP_WEB_SOCKET || 'http://localhost:5000',
        { query: {
          id: uid,
          user: userJson
        } }
      );
  
      socketio.on("connect", () => {
        console.log(socketio.id);
        // const min = parseInt(socketio.id.replace(/\D/g, ""), 10) || 0;
        // const userAnonymous = Math.floor(Math.random() * (100_000 - min) + min);
        // const userName = `Anonymous${userAnonymous.toString()}`;
        // dispatch({ type: UserActionTypes.SIGNIN, payload: { name: userName } });
      });
  
      socketio.on("disconnect", () => {
        console.log(socketio.id);
        console.log(socketio.connected);
      });
  
      socketio.on("connected user", (args) => {
        console.log(args);
      });
    
      setSocket(socketio);
  
      return () => socketio.close();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid]);

  return (
    <SocketContext.Provider value={socket}>
      { children }
    </SocketContext.Provider>
  )
}
