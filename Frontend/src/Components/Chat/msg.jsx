import { useState, useEffect, useRef } from 'react';
import './msg.css';
import { useSocketContext } from '../Socket/SocketContext';

const ChatApp = () => {
  const [message, setMessage] = useState('');
  const [receivedMessages, setReceivedMessages] = useState([]);
  const chatMessagesRef = useRef(null);
  const socket = useSocketContext();
  const user = JSON.parse(localStorage.getItem("user"));

  useEffect(() => {
    socket.emit('joined', user.userdata.firstname + " " + user.userdata.lastname);

    socket.on("sendmessage", (data) => {
      setReceivedMessages(prevMessages => [...prevMessages, data]);
      // console.log("---->", data);
    });

    return () => {
      socket.off("sendmessage");
    };
  }, []);

  useEffect(() => {
    chatMessagesRef.current.scrollTop = chatMessagesRef.current.scrollHeight;
    // console.log(receivedMessages)
  }, [receivedMessages]);

  const handleMessageSubmit = (e) => {
    e.preventDefault();
    if (message.trim() !== '' && socket) {
      socket.emit('message', { user: user.userdata.firstname + " " + user.userdata.lastname, message, path: window.location.href });
      setMessage('');
    }
  };

  return (
    <div className="chatpage " style={{ height: '88vh', overflow: 'hidden' }}>
      <div className="chatContainer" style={{ overflow: "hidden" }}>
        <div className="col-md-4 col-sm-12 col-12" style={{ width: "100%", marginRight: "-20px" }}>
          <div className="box box-warning direct-chat direct-chat-warning" >
            <div className="box-header with-border">
              <h3 className="box-title">Chat Messages</h3>
            </div>
            <div className="box-body" style={{ overflowY: "auto", height: "calc(83vh - 12vh)" }}>
              <div className="direct-chat-messages" ref={chatMessagesRef} style={{ minHeight: '70vh', overflowY: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                {receivedMessages.map((data, index) => (
                  <div
                    key={index}
                    className={`direct-chat-msg w-100 ${data.user === user.userdata.firstname + " " + user.userdata.lastname ? 'left' : 'right'}`}
                  >
                    <div className={`direct-chat-info clearfix ${data.user === user.userdata.firstname + " " + user.userdata.lastname ? 'text-end' : 'text-start'}`}>
                      <span className={`direct-chat-name `}>{data.user}</span>

                    </div>
                    <div className={`direct-chat-text ${data.user === user.userdata.firstname + " " + user.userdata.lastname ? 'float-end' : 'float-start'}`}>{data.message}</div>
                  </div>
                ))}
              </div>
            </div>
            <div className="box-footer" style={{ bottom: "0" }}>
              <form onSubmit={handleMessageSubmit}>
                <div className="input-group">
                  <input
                    type="text"
                    name="message"
                    placeholder="Type Message ..."
                    className="form-control msginput"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />&nbsp;&nbsp;&nbsp;
                  <span className="input-group-btn">
                    <button type="submit" className="btn btn-flat btnmsg">Send</button>
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
