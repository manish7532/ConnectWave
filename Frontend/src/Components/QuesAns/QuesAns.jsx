import React, { useState, useEffect, useRef } from 'react';
import './QuesAns.css';
import { useSocketContext } from '../Socket/SocketContext';


const QuesAns = ({ organizerId }) => {
    const [QueAns, setQueAns] = useState('');
    const [response, setResponse] = useState([]);
    const resRef = useRef(null);
    const socket = useSocketContext();

    const user = JSON.parse(localStorage.getItem("user"));

    useEffect(() => {
        socket.on("response", (data) => {
            setResponse(prevResponse => [...prevResponse, data]);
        });

        return () => {
            socket.off("response");
        };
    }, []);

    useEffect(() => {
        resRef.current.scrollTop = resRef.current.scrollHeight;
    }, [response]);

    const handleQueAnsSubmit = (e) => {
        e.preventDefault();
        if (QueAns.trim() !== '' && socket) {
            const userID = user.userdata._id
            socket.emit('QueAns', { user: user.userdata.firstname + " " + user.userdata.lastname, QueAns, userID, path: window.location.href });
            setQueAns('');
        }
    };

    return (
        <div className="container QAPAge ps-0 pe-0">
            <div>
                <div className="Que mt-3" style={{ height: '73vh', overflow: 'hidden' }}>
                    <div className="d-flex flex-row justify-content-center p-3 adiv text-white">
                        <span className="pb-3">Q&A</span>
                    </div>

                    <div className="p-2 que-body d-block " style={{ overflow: 'auto' }} >

                        <div className="direct-chat-messages " ref={resRef} style={{ minHeight: '66vh', overflowY: "auto", scrollbarWidth: "none" }}>
                            {response.map((item, index) => {
                                const isOrganizerOrCurrentUser = item.userID === user.userdata._id || organizerId.organizerId === user.userdata._id;
                                return (
                                    <>
                                        {
                                            isOrganizerOrCurrentUser ?
                                                <div
                                                    key={index}
                                                    className={`direct-chat-msg w-100 ${item.user === user.userdata.firstname + " " + user.userdata.lastname ? 'left' : 'right'}`}
                                                >
                                                    <div className={`direct-chat-info clearfix ${item.user === user.userdata.firstname + " " + user.userdata.lastname ? 'text-end' : 'text-start'}`}>
                                                        <span className={`direct-chat-name `}>{item.user}</span>

                                                    </div>
                                                    <div className={`direct-chat-text mr-2 p-3 Ans ${item.user === user.userdata.firstname + " " + user.userdata.lastname ? 'float-end' : 'float-start'}`}>{item.QueAns}</div>
                                                </div> : <></>
                                        }
                                    </>
                                )
                            })}
                        </div>



                    </div>
                </div>
                {/* <br /> */}
                <div className="form-group px-3 ans-footer" style={{ bottom: "0", backgroundColor: "black" }}>
                    <form onSubmit={handleQueAnsSubmit}>
                        <div className="input-group">
                            <input
                                type="text"
                                name="question"
                                placeholder="Ask your question..."
                                className="form-control msginput"
                                value={QueAns}
                                onChange={(e) => setQueAns(e.target.value)}
                            />&nbsp;&nbsp;&nbsp;
                            <span className="input-group-btn">
                                <button type="submit" className='QAbtn p-2'>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="cornflowerblue" className="bi bi-send" viewBox="0 0 16 16"  >
                                        <path d="M15.854.146a.5.5 0 0 1 .11.54l-5.819 14.547a.75.75 0 0 1-1.329.124l-3.178-4.995L.643 7.184a.75.75 0 0 1 .124-1.33L15.314.037a.5.5 0 0 1 .54.11ZM6.636 10.07l2.761 4.338L14.13 2.576zm6.787-8.201L1.591 6.602l4.339 2.76z" />
                                    </svg>
                                </button>
                            </span>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

export default QuesAns;
