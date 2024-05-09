import  { useState, useEffect, useRef } from 'react';
import './meeting.css';
import socketIOClient from 'socket.io-client';
import ChatApp from '../Chat/msg';
import QuesAns from '../QuesAns/QuesAns';
import EmojiPicker from 'emoji-picker-react';
import styles from './Video.module.css'

const socket = socketIOClient('http://localhost:8000');
// const socket = socketIOClient('http://192.168.1.105:8000');
const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

var connections = {};

const Meeting = () => {

    const user = JSON.parse(localStorage.getItem("user"));
    var socketRef = useRef();
    let socketIdRef = useRef();

    let localVideoref = useRef();

    let [videoAvailable, setVideoAvailable] = useState(true);

    let [audioAvailable, setAudioAvailable] = useState(true);

    let [video, setVideo] = useState([]);

    let [audio, setAudio] = useState();

    let [screen, setScreen] = useState();

    let [showModal, setModal] = useState(true);

    let [screenAvailable, setScreenAvailable] = useState();

    let [messages, setMessages] = useState([])

    let [message, setMessage] = useState("");

    let [newMessages, setNewMessages] = useState(3);

    let [askForUsername, setAskForUsername] = useState(true);

    let [username, setUsername] = useState("");

    const videoRef = useRef([])

    let [videos, setVideos] = useState([])

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
        };
    }, []);



    // ------------------------------------  video -------------------------------------

    useEffect(() => {
        console.log("HELLO")
        getPermissions();

    })

    let getDislayMedia = () => {
        if (screen) {
            if (navigator.mediaDevices.getDisplayMedia) {
                navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                    .then(getDislayMediaSuccess)
                    .then((stream) => { })
                    .catch((e) => console.log(e))
            }
        }
    }

    const getPermissions = async () => {
        try {
            const videoPermission = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoPermission) {
                setVideoAvailable(true);
                console.log('Video permission granted');
            } else {
                setVideoAvailable(false);
                console.log('Video permission denied');
            }

            const audioPermission = await navigator.mediaDevices.getUserMedia({ audio: true });
            if (audioPermission) {
                setAudioAvailable(true);
                console.log('Audio permission granted');
            } else {
                setAudioAvailable(false);
                console.log('Audio permission denied');
            }

            if (navigator.mediaDevices.getDisplayMedia) {
                setScreenAvailable(true);
            } else {
                setScreenAvailable(false);
            }

            if (videoAvailable || audioAvailable) {
                const userMediaStream = await navigator.mediaDevices.getUserMedia({ video: videoAvailable, audio: audioAvailable });
                if (userMediaStream) {
                    window.localStream = userMediaStream;
                    if (localVideoref.current) {
                        localVideoref.current.srcObject = userMediaStream;
                    }
                }
            }
        } catch (error) {
            console.log(error);
        }
    };

    useEffect(() => {
        if (video !== undefined && audio !== undefined) {
            getUserMedia();
            console.log("SET STATE HAS ", video, audio);

        }
    }, [video, audio])


    let getMedia = () => {
        setVideo(videoAvailable);
        setAudio(audioAvailable);
        connectToSocketServer();

    }




    let getUserMediaSuccess = (stream) => {
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                console.log(description)
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setVideo(false);
            setAudio(false);

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            for (let id in connections) {
                connections[id].addStream(window.localStream)

                connections[id].createOffer().then((description) => {
                    connections[id].setLocalDescription(description)
                        .then(() => {
                            socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                        })
                        .catch(e => console.log(e))
                })
            }
        })
    }

    let getUserMedia = () => {
        if ((video && videoAvailable) || (audio && audioAvailable)) {
            navigator.mediaDevices.getUserMedia({ video: video, audio: audio })
                .then(getUserMediaSuccess)
                .then((stream) => { })
                .catch((e) => console.log(e))
        } else {
            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { }
        }
    }





    let getDislayMediaSuccess = (stream) => {
        console.log("HERE")
        try {
            window.localStream.getTracks().forEach(track => track.stop())
        } catch (e) { console.log(e) }

        window.localStream = stream
        localVideoref.current.srcObject = stream

        for (let id in connections) {
            if (id === socketIdRef.current) continue

            connections[id].addStream(window.localStream)

            connections[id].createOffer().then((description) => {
                connections[id].setLocalDescription(description)
                    .then(() => {
                        socketRef.current.emit('signal', id, JSON.stringify({ 'sdp': connections[id].localDescription }))
                    })
                    .catch(e => console.log(e))
            })
        }

        stream.getTracks().forEach(track => track.onended = () => {
            setScreen(false)

            try {
                let tracks = localVideoref.current.srcObject.getTracks()
                tracks.forEach(track => track.stop())
            } catch (e) { console.log(e) }

            let blackSilence = (...args) => new MediaStream([black(...args), silence()])
            window.localStream = blackSilence()
            localVideoref.current.srcObject = window.localStream

            getUserMedia()

        })
    }

    let gotMessageFromServer = (fromId, message) => {
        var signal = JSON.parse(message)

        if (fromId !== socketIdRef.current) {
            if (signal.sdp) {
                connections[fromId].setRemoteDescription(new RTCSessionDescription(signal.sdp)).then(() => {
                    if (signal.sdp.type === 'offer') {
                        connections[fromId].createAnswer().then((description) => {
                            connections[fromId].setLocalDescription(description).then(() => {
                                socketRef.current.emit('signal', fromId, JSON.stringify({ 'sdp': connections[fromId].localDescription }))
                            }).catch(e => console.log(e))
                        }).catch(e => console.log(e))
                    }
                }).catch(e => console.log(e))
            }

            if (signal.ice) {
                connections[fromId].addIceCandidate(new RTCIceCandidate(signal.ice)).catch(e => console.log(e))
            }
        }
    }



    let connectToSocketServer = () => {
        socketRef.current = socketIOClient.connect('http://localhost:8000', { secure: false })

        socketRef.current.on('signal', gotMessageFromServer)

        const path = window.location.href;
        const username = user.userdata.firstname + " " + user.userdata.lastname
        let data = [path, username]
        socketRef.current.on('connect', () => {
            socketRef.current.emit('join-call', data)
            socketIdRef.current = socketRef.current.id
            data = [];

            socketRef.current.on('user-left', (id) => {
                setVideos((videos) => videos.filter((video) => video.socketId !== id))
            })


            socketRef.current.on('user-joined', (id, clients, usernames) => {
                console.log(usernames)
                clients.forEach((socketListId, index) => {
                    connections[socketListId] = new RTCPeerConnection(peerConfigConnections);

                    // Wait for their ice candidate       
                    connections[socketListId].onicecandidate = function (event) {
                        if (event.candidate != null) {
                            socketRef.current.emit('signal', socketListId, JSON.stringify({ 'ice': event.candidate }));
                        }
                    }

                    // Wait for their video stream
                    connections[socketListId].onaddstream = (event) => {
                        console.log("BEFORE:", videoRef.current);
                        console.log("FINDING ID: ", socketListId);

                        let videoExists = videoRef.current.find(video => video.socketId === socketListId);

                        if (videoExists) {
                            console.log("FOUND EXISTING");

                            // Update the stream of the existing video
                            setVideos(videos => {
                                const updatedVideos = videos.map(video =>
                                    video.socketId === socketListId ? { ...video, stream: event.stream, username: usernames[index] } : video
                                );
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        } else {
                            // Create a new video
                            console.log("CREATING NEW");
                            let newVideo = {
                                socketId: socketListId,
                                stream: event.stream,
                                username: usernames[index], // Include username
                                autoplay: true,
                                playsinline: true
                            };

                            setVideos(videos => {
                                const updatedVideos = [...videos, newVideo];
                                videoRef.current = updatedVideos;
                                return updatedVideos;
                            });
                        }
                    };

                    // Add the local video stream
                    if (window.localStream !== undefined && window.localStream !== null) {
                        connections[socketListId].addStream(window.localStream);
                    } else {
                        let blackSilence = (...args) => new MediaStream([black(...args), silence()]);
                        window.localStream = blackSilence();
                        connections[socketListId].addStream(window.localStream);
                    }
                });







                if (id === socketIdRef.current) {
                    for (let id2 in connections) {
                        if (id2 === socketIdRef.current) continue

                        try {
                            connections[id2].addStream(window.localStream)
                        } catch (e) { }

                        connections[id2].createOffer().then((description) => {
                            connections[id2].setLocalDescription(description)
                                .then(() => {
                                    socketRef.current.emit('signal', id2, JSON.stringify({ 'sdp': connections[id2].localDescription }))
                                })
                                .catch(e => console.log(e))
                        })
                    }
                }
            })
        })
    }

    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }
    let black = ({ width = 640, height = 480 } = {}) => {
        let canvas = Object.assign(document.createElement("canvas"), { width, height })
        canvas.getContext('2d').fillRect(0, 0, width, height)
        let stream = canvas.captureStream()
        return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    }

    let handleVideo = () => {
        setVideo(!video);
        getUserMedia();
    }
    let handleAudio = () => {
        setAudio(!audio)
        getUserMedia();
    }

    useEffect(() => {
        if (screen !== undefined) {
            getDislayMedia();
        }
    }, [screen])
    let handleScreen = () => {
        setScreen(!screen);
    }

    let handleEndCall = () => {
        try {
            const path = window.location.href;
            const id = socketIdRef.current

            let leaveArr = [path, id]
            socketRef.current.emit('leave', leaveArr);
            socketRef.current.emit('disconnect', () => {
                socketRef.current.emit('leave', leaveArr);
            })

            let tracks = localVideoref.current.srcObject.getTracks()
            tracks.forEach(track => track.stop())
        } catch (e) { }
        window.location.href = "/dashboard"
    }



    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }










    return (
        <>

            {askForUsername === true ?

                <div className='row m-0 justify-content-center'>


                    <h2 className='text-center'>Enter into Lobby </h2>
                    {/* <input className='form-control ' style={{ width: "50vw" }} id="outlined-basic" label="Username" value={username} onChange={e => setUsername(e.target.value)} /> <br /> */}


                    <video style={{ height: '60vh', borderRadius: '1cap' }} ref={localVideoref} autoPlay muted></video>

                    <button className='btn btn-sm btn-primary mt-3' style={{ width: "100px" }} onClick={connect}>Connect</button>
                </div> :






                <div className='allcontent'>
                    <div className='row m-0 d-flex meetingdiv' style={{ height: '87vh', backgroundColor: "black" }}>
                        <div className="col-md-9 my-auto">



                            <video id='localvideo' className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
                            <span className={styles.meetUserVideoname1}>a</span>
                            <span className={styles.meetUserVideoname}>Me</span>

                            <div className=' d-flex gap-2 justify-content-center'>
                                {/* {console.log(videos)} */}
                                {videos.map((video) => (

                                    <div key={video.socketId} ><video muted className={styles.remoteVid}
                                        data-socket={video.socketId}
                                        ref={ref => {
                                            if (ref && video.stream) {
                                                ref.srcObject = video.stream;
                                            }
                                        }}
                                        autoPlay
                                    ><span >{video.username}</span>
                                    </video>
                                        <p className='text-center'>{video.username}</p>
                                    </div>


                                ))}

                            </div>

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
                            <div className="button-container" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                                <a className="btn text-light mb-1">
                                    <img src="./logo nav.png" height="30vh" /><br />
                                    <span style={{ fontSize: '1.5vh' }}>ConnectWave</span>
                                </a>
                                <a className="btn text-light av" onClick={handleAudio} type="button">
                                    <i className="fas fa-microphone-slash"></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>{audio === true ? 'Mute' : 'Unmute'}</span>
                                </a>
                                <a className="btn text-light av" onClick={handleVideo} type="button">
                                    <i className="fas fa-video-slash"></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>Video</span>
                                </a>
                                <a className="btn text-light av" type="button" onClick={toggleUserList}>
                                    <i className="fa-solid fa-users"></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>Participants</span>
                                </a>
                                {screenAvailable === true ?
                                    <a className="btn text-light av" onClick={handleScreen} type="button">
                                        <i className="bi bi-arrow-up-square-fill"></i><br />
                                        <span style={{ fontSize: '1.5vh' }}>Screen Sharing</span>
                                    </a>
                                    : <></>
                                }
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
                                <a onClick={toggleQuesAns} className="btn text-light av" type="button">
                                    <i className="far fa-comments"></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>QnA</span>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-2 col-sm-0">
                            <a onClick={handleEndCall} className="btn btn-danger text-light leave" type="button">Leave</a>
                        </div>
                    </nav>
                </div>
            }
        </>
    );
};

export default Meeting;
