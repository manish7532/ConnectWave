import React, { useState, useEffect } from 'react';
import './meeting.css';
import socketIOClient from 'socket.io-client';
import ChatApp from '../Chat/msg';
import QuesAns from '../QuesAns/QuesAns';
import EmojiPicker from 'emoji-picker-react';

const socket = socketIOClient('http://localhost:8000');
// const socket = socketIOClient('http://192.168.1.105:8000');

const Meeting = () => {
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [showUserList, setShowUserList] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [receivedEmoji, setReceivedEmoji] = useState();
    const [showQuesAns, setShowQuesAns] = useState(false);

    const toggleChat = () => {
        setShowChat(!showChat);
        setShowEmojiPicker(false);
        setShowUserList(false);
        setShowQuesAns(false);
    };

    const toggleUserList = () => {
        setShowUserList(!showUserList);
        setShowChat(false);
        setShowEmojiPicker(false);
        setShowQuesAns(false);
    };

    const toggleEmojiPicker = () => {
        setShowEmojiPicker(!showEmojiPicker);
        setShowChat(false);
        setShowUserList(false);
        setShowQuesAns(false);
    };

    const toggleQuesAns = () => {
        setShowQuesAns(!showQuesAns);
        setShowChat(false);
        setShowUserList(false);
        setShowEmojiPicker(false);
    };
    const handleEmojiClick = (emojiObject) => {
        socket.emit('emoji', emojiObject.emoji);
        setShowEmojiPicker(false);
        setShowChat(false);
        setShowQuesAns(false);
    };


    useEffect(() => {
        socket.on('userList', (users) => {
            setConnectedUsers(users);
        });

        socket.on('sendEmoji', (emojiObject) => {
            // console.log("Received emoji on client:", emojiObject);
            setReceivedEmoji(emojiObject);
            setTimeout(() => {
                setReceivedEmoji(null);
            }, 2000);
        });

        return () => {
            socket.off('userList');
            // socket.off('sendEmoji');
        };
    }, []);

    return (
        <>
            <div className='allcontent'>
                <div className='row m-0 d-flex meetingdiv' style={{ height: '87vh', backgroundColor: "black" }}>
                    <div className="col-md-9">Meeting

                        {/* emoji display */}
                        {receivedEmoji && (
                            <div className="emoji-container" style={{ position: 'fixed' }}>
                                <span role="img" aria-label="emoji" style={{ fontSize: '55px' }}>{receivedEmoji.emojiObject} </span>
                            </div>
                        )}

                    </div>

                    <div className="col-md-3 col-sm-11" style={{ overflow: 'hidden' }} >
                        <div className="container-fluid" style={{ borderRadius: '1cap', display: showChat ? 'block' : 'none' }}>
                            <ChatApp />
                        </div>
                        <div className="container-fluid" style={{ borderRadius: '1cap', display: showQuesAns ? 'block' : 'none' }}>
                            <QuesAns />
                        </div>

                        {showEmojiPicker && (
                            <div id='emoji' style={{ position: 'absolute', right: '5vw', bottom: "120px" }}>
                                <EmojiPicker
                                    onEmojiClick={handleEmojiClick}
                                    height={600}
                                    disableSearchBar={true}
                                    disableSkinTonePicker={true}
                                    reactionsDefaultOpen={true}
                                />
                            </div>
                        )}


                        {showUserList && (
                            <div className='plist' style={{ border: '1px solid #ccc', borderRadius: '5px', padding: '10px' }}>
                                <h3 style={{ color: 'white', marginTop: "20px", marginBottom: "20px", textAlign: 'center' }}>Participants</h3>
                                <ul className="user-list" style={{ listStyleType: 'none' }}>
                                    {connectedUsers.map((user, index) => {
                                        const names = user.split(' ');
                                        const firstName = names[0];
                                        const lastName = names.length > 1 ? names[names.length - 1] : '';

                                        const initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()}`;

                                        return (
                                            <li key={index}>
                                                <div className='mt-1'>
                                                    <span className='initials'>{initials}</span>
                                                    {user}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            </div>
                        )}


                    </div>
                </div>

                <nav className="row m-0 navbar mnav fixed-bottom" style={{ height: '13vh', bottom: "0" }}>
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

                            </a>
                            <a className="btn text-light av" type="button">
                                <i className="bi bi-arrow-up-square-fill"></i><br />
                                <span style={{ fontSize: '1.5vh' }}>Share Screen</span>
                            </a>
                            <a className="btn text-light av" type="button" onClick={toggleChat}>
                                <i className="fa-solid fa-message" ></i><br />
                                <span style={{ fontSize: '1.5vh' }}>Chat</span>
                            </a>
                            <a className="btn text-light av" type="button">
                                <i className="bi bi-record-circle"></i><br />
                                <span style={{ fontSize: '1.5vh' }}>Record</span>
                            </a>
                            <a className="btn text-light av" type="button" onClick={toggleEmojiPicker} >
                                <i className="fas fa-face-smile"></i><br />
                                <span style={{ fontSize: '1.5vh' }}>Reactions</span>
                            </a>
                            <a className="btn text-light av" type="button" onClick={toggleQuesAns}>
                                <i className="far fa-comments"></i><br />
                                <span style={{ fontSize: '1.5vh' }}>QnA</span>
                            </a>
                        </div>
                    </div>
                    <div className="col-lg-2 col-md-2 col-sm-0">
                        <a className="btn btn-danger text-light leave" type="button">Leave</a>
                    </div>
                </nav>
            </div>
        </>
    );
};

export default Meeting;
