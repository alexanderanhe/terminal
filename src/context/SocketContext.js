import React, { useContext, useEffect, useState } from 'react'
import io from 'socket.io-client';

const SocketContext = React.createContext();

export function useSocket() {
  return useContext(SocketContext)
}

export function SocketProvider({ id, children }) {
  const [socket, setSocket] = useState();

  useEffect(() => {
    const socketio  = io(
      process.env.REACT_APP_WEB_SOCKET || 'http://localhost:5000',
      { query: { id } }
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
  }, [id]);

  return (
    <SocketContext.Provider value={socket}>
      { children }
    </SocketContext.Provider>
  )
}
