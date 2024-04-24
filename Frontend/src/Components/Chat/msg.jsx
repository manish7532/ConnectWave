import React, { useState, useEffect, useRef } from 'react';
import socketIOClient from 'socket.io-client';
import './msg.css';

const ENDPOINT = "http://localhost:8000";

const ChatApp = () => {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const [socket, setSocket] = useState();
  const chatMessagesRef = useRef(null);

  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    const socket = socketIOClient(ENDPOINT, { transports: ['websocket'] });
    setSocket(socket);

    socket.on("connect", () => {
      socket.emit('joined', user.userdata.firstname);
    });
    
  
    socket.on("sendmessage", (data) => {
      setReceivedMessages(prevMessages => [...prevMessages, data]);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
  }, [receivedMessages]);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '' && socket) {
      socket.emit('message', { user: user.userdata.firstname, message });
      setMessage('');
    }
  };

  return (
    <div className="chatpage" style={{ height: '87vh', overflow: 'auto'}}>
      <div className="chatContainer" style={{ overflow: "hidden" }}>
        <div className="col-md-4 col-sm-12 col-12" style={{ width: "100%", marginRight: "-20px" }}>
          <div className="box box-warning direct-chat direct-chat-warning" >
            <div className="box-header with-border">
              <h3 className="box-title">Chat Messages</h3>
            </div>
            <div className="box-body"  style={{ overflowY: "auto", height: "calc(87vh - 120px)" }}>
              <div className="direct-chat-messages" ref={chatMessagesRef}  style={{ minHeight: "100%", overflowY: "auto" }}>
                {receivedMessages.map((data, index) => (
                  <div
                    key={index}
                    className={`direct-chat-msg w-100 ${data.user === user.userdata.firstname ? 'left' : 'right'}`}
                  >
                    <div className={`direct-chat-info clearfix ${data.user === user.userdata.firstname ? 'text-end' : 'text-start'}`}>
                      <span className={`direct-chat-name `}>{data.user}</span>

                    </div>
                    <div className={`direct-chat-text ${data.user === user.userdata.firstname ? 'float-end' : 'float-start'}`}>{data.message}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="box-footer" style={{ position: "fixed", top: "80vh" }}>
              <form onSubmit={handleMessageSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    name="message"
                    placeholder="Type Message ..."
                    className="form-control"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                  <span className="input-group-btn">
                    <button type="submit" className="btn btn-warning btn-flat">Send</button>
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatApp;
