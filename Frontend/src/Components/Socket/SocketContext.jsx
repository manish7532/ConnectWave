import { createContext, useContext, useEffect, useState } from 'react';
import socketIOClient from 'socket.io-client';

const SocketContext = createContext();

export const useSocketContext = () => {
  return useContext(SocketContext);
};


export const SocketProvider = ({ children }) => {
  const ENDPOINT = import.meta.env.VITE_API_URL;

  let [socket, setSocket] = useState(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!socket) {
      const newsocket = socketIOClient(ENDPOINT, { transports: ['websocket'] });
      // console.log("socket is connectted")

      setSocket(newsocket);


      newsocket.on('connect', () => {
        setConnected(true);
      });

      newsocket.on('disconnect', () => {
        setConnected(false);
      });

      return () => {
        newsocket.close();
        setSocket(null)
        setConnected(false);
      }
    }
    else {
      if (socket) {
        console.log("socket is already disconnectted")
        socket.close();
        socket = null;
        setConnected(false);
      }
    }
  }, []);


  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
