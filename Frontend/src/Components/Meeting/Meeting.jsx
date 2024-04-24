import React, { useState, useEffect } from 'react';
import './meeting.css';
import socketIOClient from 'socket.io-client';
import ChatApp from '../Chat/msg';

const socket = socketIOClient('http://localhost:8000');

const Meeting = () => {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const [showChat, setShowChat] = useState(false);

    const toggleChat = () => {
        setShowChat(!showChat);
    };

    useEffect(() => {
        socket.on('userList', (users) => {
            console.log(users)
            setConnectedUsers(users);
        });
    }, []);
    
    // console.log(connectedUsers)
    const toggleUserList = () => {
        setShowUserList(!showUserList);
    };

    return (
        <>
            <div className='row m-0 d-flex' style={{ height: '87vh', color: "black", backgroundColor: "white" }}>
                <div className="col-md-9">Meeting</div>
                <div className="col-md-3" style={{ display: showChat ? 'block' : 'none' }}>
                    <ChatApp />
                </div>
            </div>

            <nav className="row m-0 navbar mnav sticky-bottom" style={{ height: '13vh' }}>
                <div className="col-lg-2 col-md-2 col-sm-0"></div>
                <div className="col-lg-8 col-md-8 col-sm-12 d-flex gap-2 justify-content-center">
                    <div className="button-container">
                        <a className="btn text-light mb-1">
                            <img src="./logo nav.png" height="30vh" /><br />
                            <span style={{ fontSize: '1.5vh' }}>ConnectWave</span>
                        </a>
                        <a className="btn text-light av" type="button">
                            <i className="fas fa-microphone-slash"></i><br />
                            <span style={{ fontSize: '1.5vh' }}>Mute</span>
                        </a>
                        <a className="btn text-light av" type="button">
                            <i className="fas fa-video-slash"></i><br />
                            <span style={{ fontSize: '1.5vh' }}>Start Video</span>
                        </a>
                        <a className="btn text-light av" type="button" onClick={toggleUserList}>
                            <i className="fa-solid fa-users"></i><br />
                            <span style={{ fontSize: '1.5vh' }}>Participants</span>
                            <ul style={{display:'none'}}>
                                {connectedUsers.map((user, index) => (
                                    <li key={index}>{user}</li>
                                ))}
                            </ul>
                        </a>
                        <a className="btn text-light av" type="button">
                            <i className="bi bi-arrow-up-square-fill"></i><br />
                            <span style={{ fontSize: '1.5vh'}}>Share Screen</span>
                        </a>
                        <a className="btn text-light av" type="button" onClick={toggleChat}>
                            <i className="fa-solid fa-message" ></i><br />
                            <span style={{ fontSize: '1.5vh' }}>Chat</span>
                        </a>
                        <a className="btn text-light av" type="button">
                            <i className="bi bi-record-circle"></i><br />
                            <span style={{ fontSize: '1.5vh' }}>Record</span>
                        </a>
                        <a className="btn text-light av" type="button" >
                            <i className="fas fa-face-smile"></i><br />
                            <span style={{ fontSize: '1.5vh' }}>Reactions</span>
                        </a>
                        <a className="btn text-light av" type="button">
                            <i className="far fa-comments"></i><br />
                            <span style={{ fontSize: '1.5vh' }}>QnA</span>
                        </a>
                    </div>
                </div>
                <div className="col-lg-2 col-md-2 col-sm-0">
                    <a className="btn btn-danger text-light leave" type="button">Leave</a>
                </div>
            </nav>
        </>
    );
};

export default Meeting;

