import { useState, useEffect, useRef } from 'react';
import './meeting.css';
import ChatApp from '../Chat/msg';
import QuesAns from '../QuesAns/QuesAns';
import EmojiPicker from 'emoji-picker-react';
import styles from './Video.module.css'
import { useLocation, useNavigate } from 'react-router-dom';
import logoimg from '../images/logo nav.png'
import axios from 'axios';
import { useSocketContext } from '../Socket/SocketContext';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import copy from 'clipboard-copy';

const peerConfigConnections = {
    "iceServers": [
        { "urls": "stun:stun.l.google.com:19302" }
    ]
}

var connections = {};

const Meeting = () => {

    const user = JSON.parse(localStorage.getItem("user"));
    const { state } = useLocation();
    const roomID = state.roomID;
    const newEvent = state.event;
    const socket = useSocketContext();
    var socketRef = useRef();
    let socketIdRef = useRef();
    let localVideoref = useRef();
    let [videoAvailable, setVideoAvailable] = useState(true);
    let [audioAvailable, setAudioAvailable] = useState(true);
    let [video, setVideo] = useState([]);
    let [audio, setAudio] = useState();
    let [screen, setScreen] = useState();
    let [screenAvailable, setScreenAvailable] = useState();
    let [askForUsername, setAskForUsername] = useState(true);
    let [username, setUsername] = useState("");
    const videoRef = useRef([])
    let [videos, setVideos] = useState([])


    // screen recording
    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorderInstance, setMediaRecorderInstance] = useState(null);
    const [connectedUsers, setConnectedUsers] = useState([]);
    const [receivedEmoji, setReceivedEmoji] = useState();
    const [showUserList, setShowUserList] = useState(false);
    const [showChat, setShowChat] = useState(false);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
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
        let emo = emojiObject.emoji;
        let path = window.location.href;
        socket.emit('emoji', { emo, path });
        setShowEmojiPicker(false);
        setShowChat(false);
        setShowQuesAns(false);
    };

    useEffect(() => {
        socket.on('userList', (users) => {
            setConnectedUsers(users);
        });

        socket.on('sendEmoji', (emo) => {
            setReceivedEmoji(emo);
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
        getPermissions();
    }, [])

    // let getDislayMedia = () => {
    //     if (screen) {
    //         if (navigator.mediaDevices.getDisplayMedia) {
    //             navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
    //                 .then(getDislayMediaSuccess)
    //                 .then((stream) => { })
    //                 .catch((e) => console.log(e))
    //         }
    //     }
    // }

    //--------------------screen shared --------------------------------
    let getDislayMedia = () => {
        if (navigator.mediaDevices.getDisplayMedia) {
            navigator.mediaDevices.getDisplayMedia({ video: true, audio: true })
                .then((stream) => {
                    getDislayMediaSuccess(stream);
                    window.screenStream = stream;
                    document.getElementById('screenShare').innerHTML = 'Stop Sharing';

                })
                .catch((e) => console.log(e));
        }
    }


    const stopDisplayMedia = () => {
        if (window.screenStream) {
            let tracks = window.screenStream.getTracks();
            tracks.forEach(track => track.stop());
            getUserMedia()
            document.getElementById('screenShare').innerHTML = 'Share Screen';
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
            // console.log("SET STATE HAS ", "Video==>", video, ' Audio==>', audio);
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
            localVideoref.current.srcObject = window.localStream;

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
                let tracks = localVideoref.current.srcObject.getTracks();
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

    let connectToSocketServer = async () => {

        //--------------------attendance-----------------------------------
        try {
            // console.log('new Event data========>', JSON.stringify(newEvent))
            const userID = user.userdata._id;
            const eventID = newEvent._id;
            const role = newEvent.organizerId === user.userdata._id;
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/participants`, { userID, eventID, role });
        } catch (error) {
            console.log(error);
        }

        socketRef.current = socket;

        socketRef.current.on('signal', gotMessageFromServer);

        const path = window.location.href;
        const username = user.userdata.firstname + " " + user.userdata.lastname
        const userID = user.userdata._id;
        let data = [path, username, roomID, userID]

        // socketRef.current.on('connect', () => {
        socketRef.current.emit('join-call', data)
        socketIdRef.current = socketRef.current.id
        data = [];

        socketRef.current.on('user-left', (id) => {
            setVideos((videos) => videos.filter((video) => video.socketId !== id))
        })

        socketRef.current.on('user-joined', (id, clients, usernames, userIDs) => {

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
                                video.socketId === socketListId ? { ...video, stream: event.stream, username: usernames[index], userID: userIDs[index] } : video
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
                            userID: userIDs[index], // Include userID
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
        });

        // })
    }


    let silence = () => {
        let ctx = new AudioContext()
        let oscillator = ctx.createOscillator()
        let dst = oscillator.connect(ctx.createMediaStreamDestination())
        oscillator.start()
        ctx.resume()
        return Object.assign(dst.stream.getAudioTracks()[0], { enabled: false })
    }


    // let black = ({ width = 640, height = 480 } = {}) => {
    //     let canvas = Object.assign(document.createElement("canvas"), { width, height })
    //     canvas.getContext('2d').fillRect(0, 0, width, height)
    //     let stream = canvas.captureStream()
    //     return Object.assign(stream.getVideoTracks()[0], { enabled: false })
    // }

    let black = ({ width = 640, height = 480 } = {}) => {
        // Retrieve user data from localStorage
        let user = JSON.parse(localStorage.getItem('user'));
        let fullName = `${user.userdata.firstname} ${user.userdata.lastname}`;
        console.log('fullname=========>', fullName)

        // Extract initials
        let names = fullName.split(' ');
        let initials = names.map(name => name.charAt(0).toUpperCase()).join('');

        // Create canvas and draw initials
        let canvas = Object.assign(document.createElement("canvas"), { width, height });
        let context = canvas.getContext('2d');
        context.fillStyle = 'white';
        context.fillRect(0, 0, width, height);

        context.fillStyle = 'white';
        context.font = 'bold 100px Arial';
        context.textAlign = 'center';
        context.textBaseline = 'middle';
        context.fillText(initials, width / 2, height / 2);

        let stream = canvas.captureStream();
        return Object.assign(stream.getVideoTracks()[0], { enabled: false });
    }

    let handleVideo = () => {
        setVideo(!video);
    }
    let handleAudio = () => {
        setAudio(!audio)
    }




    useEffect(() => {
        if (screen) {
            getDislayMedia();
            let path = window.location.href;
            socket.emit('fullScreen', path);

        } else {
            if (window.screenStream) {
                stopDisplayMedia();
                let path = window.location.href;
                socket.emit('normalScreen', path);

            }
        }
    }, [screen]);



    let handleFullScreen = () => {
        if (newEvent.organizerId != user.userdata._id) {
            document.querySelectorAll('.notmain').forEach(function (element) {
                element.classList.add('revid');
            });
            document.querySelector('.mainvid').classList.add('hostvid');
        }
    }
    socket.on('fullScreen', () => { handleFullScreen() });



    let handleNormalScreen = () => {
        if (newEvent.organizerId != user.userdata._id) {
            document.querySelectorAll('.notmain').forEach(function (element) {
                element.classList.remove('revid');
            });
            document.querySelector('.mainvid').classList.remove('hostvid');
        }
    }
    socket.on('normalScreen', () => { handleNormalScreen() });



    let handleScreen = () => {
        // setScreen(!screen);
        setScreen(prevScreen => !prevScreen);
    }

    const navigate = useNavigate()
    let handleEndCall = async () => {
        try {
            const path = window.location.href;
            const id = socketIdRef.current;
            let leaveArr = [path, id];
            socketRef.current.emit("leave", leaveArr);
            let tracks = localVideoref.current.srcObject.getTracks();
            tracks.forEach((track) => track.stop());
            const userID = user.userdata._id;
            const eventID = newEvent && newEvent._id;
            const response = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/participants-left`,
                { userID, eventID }
            );
            if (newEvent.organizerId === user.userdata._id) {
                window.location.href = "/dashboard";
            } else {
                localStorage.setItem("roomID", roomID);
                window.location.href = "/feedback";
            }
        } catch (e) {
            console.log(e);
        }
    };









    let connect = () => {
        setAskForUsername(false);
        getMedia();
    }

    //--------------------- recording----------------------
    const startScreenRecording = async () => {
        try {
            const newstream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: true });

            const mediaRecorder = new MediaRecorder(newstream);

            const recordedChunks = [];

            mediaRecorder.ondataavailable = (event) => {
                recordedChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                const recordedBlob = new Blob(recordedChunks, { type: 'video/webm' });

                const downloadLink = document.createElement('a');
                downloadLink.href = URL.createObjectURL(recordedBlob);
                downloadLink.download = 'recorded-screen.webm';
                downloadLink.click();
            };

            mediaRecorder.start();

            setIsRecording(true);
            setMediaRecorderInstance(mediaRecorder);
        } catch (error) {
            console.error('Error starting screen recording:', error);
        }
    };

    const stopScreenRecording = () => {
        if (mediaRecorderInstance && mediaRecorderInstance.state !== 'inactive') {

            mediaRecorderInstance.stop();
            setIsRecording(false);
        }
    };

    const handleStartRecording = () => {
        startScreenRecording();
    };

    const handleStopRecording = () => {
        stopScreenRecording();
    };


    //--------------------- copy meeeting id--------------------------------
    const handleCopy = (roomID) => {
        copy(roomID)
        toast.success("Meeting ID Copied", { position: 'top-center' })
    }

    useEffect(() => {
        if (window.innerWidth > 767) {
            toggleChat();
        }
    }, [])


    return (
        <>
            {askForUsername === true ?
                <>
                    <nav className="navbar navbar-expand-lg text-light dnav" style={{ backgroundColor: "#001247" }} data-bs-theme="dark">
                        <div className="container-fluid">
                            <div className="d-flex align-items-center">
                                <div className="logo">
                                    <img src={logoimg} height="40vh" alt="ConnectWave Logo" />
                                </div>
                                <h5 className="mt-2 ms-2">ConnectWave</h5>
                            </div>
                        </div>
                    </nav>
                    <div className='row m-0 d-flex flex-column justify-content-center align-items-center mt-3'>
                        <h2 className='text-center'>Enter into Lobby </h2>
                        <video className='localvid' ref={localVideoref} autoPlay muted></video>
                        <button className='btn btn-sm btn-primary mt-3' style={{ width: "100px" }} onClick={connect}>Connect</button>
                    </div></> :


                <div className='allcontent'>
                    <div className='row m-0 d-flex meetingdiv ' style={{ height: '87vh', backgroundColor: "black" }}>
                        <div className={`col-md-9 my-auto d-md-block ${showUserList || showChat || showQuesAns ? 'd-none' : ''} `} >

                            {video ? <><video id='localvideo' className={styles.meetUserVideo} ref={localVideoref} autoPlay muted></video>
                                {/* <span className={styles.meetUserVideoname1}>a</span> */}
                                <span className={styles.meetUserVideoname}>You</span></>
                                : <>
                                    <div id='localvideo' style={{ border: '.1px solid grey', width: '13vw', minWidth: '150px', borderRadius: '8px', color: 'white' }} className={`${styles.meetUserVideo} d-flex justify-content-center align-items-center`}>
                                        <span style={{ borderRadius: '50%', backgroundColor: '#737ce2', width: '4vw', minWidth: '66px', height: '8vh' }}><p className='text-center fs-3 mt-2'>{user.userdata.firstname.charAt(0).toUpperCase()}{user.userdata.lastname.charAt(0).toUpperCase()}</p></span>
                                    </div>
                                </>}

                            <div className={styles.conferenceView}>
                                {videos.map((v) => (
                                    newEvent.organizerId === v.userID ? <>
                                        <div className='position-relative'>
                                            <video key={v.socketId}
                                                className={`${styles.remoteVid}  mainvid`}
                                                style={{ border: '.2px solid gray', borderRadius: '8px' }}
                                                data-socket={v.socketId}
                                                ref={(ref) => {
                                                    if (ref && v.stream) {
                                                        ref.srcObject = v.stream;
                                                    }
                                                }}
                                                autoPlay
                                            />
                                            <p className={`${styles.username} text-center`}>{v.username}</p>
                                        </div>
                                    </>

                                        : <>
                                            <div className='position-relative'>
                                                <video key={v.socketId} className={`${styles.remoteVid}  notmain`}
                                                    style={{ border: '.2px solid gray', borderRadius: '8px' }}
                                                    data-socket={v.socketId}
                                                    ref={ref => {
                                                        if (ref && v.stream) {
                                                            ref.srcObject = v.stream;
                                                        }
                                                    }}
                                                    autoPlay muted
                                                >
                                                </video>
                                                <p className={`${styles.username} notmain text-center`}>{v.username}</p>
                                            </div>
                                        </>
                                ))}
                            </div>

                            {/* <div className={styles.conferenceView}>
                                {videos.map((v) => (
                                    <div key={v.socketId} className='position-relative' data-socket={v.socketId}>
                                        <video className={`${newEvent.organizerId === v.userID ? 'remoteVid mainvid' : 'notmain remoteVid'}`}
                                            ref={(ref) => {
                                                if (ref && v.stream) {
                                                    ref.srcObject = v.stream;
                                                }
                                            }}
                                            autoPlay
                                            muted={newEvent.organizerId !== v.userID}
                                            style={{ border: '.2px solid gray', borderRadius: '8px' }}
                                        />
                                        <p className={`${styles.username} text-center`}>{v.username}</p>
                                    </div>
                                ))}
                            </div> */}








                            {/* emoji display */}
                            {receivedEmoji && (
                                <div className="emoji-container" style={{ position: 'fixed' }}>
                                    <span role="img" aria-label="emoji" style={{ fontSize: '55px' }}>{receivedEmoji.emo} </span>
                                </div>
                            )}

                        </div>

                        <div className="col-md-3 col-sm-11" style={{ overflow: 'hidden' }} >
                            <div className="container-fluid ps-0 pe-0" style={{ borderRadius: '1cap', display: showChat ? 'block' : 'none' }}>
                                <ChatApp />
                            </div>
                            <div className="container-fluid ps-0 pe-0" style={{ borderRadius: '1cap', display: showQuesAns ? 'block' : 'none' }}>
                                <QuesAns organizerId={{ organizerId: newEvent.organizerId }} />
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

                                            const initials = `${firstName.charAt(0).toUpperCase()}${lastName.charAt(0).toUpperCase()} `;

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
                        <div className="col-lg-8 col-md-8 col-sm-12 d-flex gap-2 justify-content-center ">
                            <div className="button-container" style={{ WebkitOverflowScrolling: "touch", scrollbarWidth: "none" }}>
                                <a className="btn av text-light mb-1 justify-content-start">
                                    <img src={logoimg} height="30vh" /><br />
                                    <span style={{ fontSize: '1.5vh' }}>ConnectWave</span>
                                </a>
                                {newEvent.organizerId === user.userdata._id ?
                                    <a className="btn text-light av" onClick={handleAudio} type="button">
                                        {audio === true ? <i className="fas fa-microphone"></i> :
                                            <i className="fa-solid fa-microphone-slash"></i>}

                                        <br />
                                        <span style={{ fontSize: '1.5vh' }}>{audio === true ? 'Mute' : 'Unmute'}</span>
                                    </a>
                                    : <></>
                                }
                                <a className="btn text-light av" onClick={handleVideo} type="button">
                                    {video ? <i className="fas fa-video"></i> : <i className="fas fa-video-slash"></i>}<br />
                                    <span style={{ fontSize: '1.5vh' }}>Video</span>
                                </a>
                                <a className="btn text-light av" type="button" onClick={toggleUserList}>
                                    <i className="fa-solid fa-users"></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>Participants</span>
                                </a>

                                {newEvent.organizerId === user.userdata._id && screenAvailable === true ?
                                    <a className="btn text-light av" onClick={handleScreen} type="button">
                                        <i className="bi bi-arrow-up-square-fill"></i><br />
                                        <span style={{ fontSize: '1.5vh' }} id='screenShare'>Share Screen</span>
                                    </a>
                                    : <></>
                                }
                                <a className="btn text-light av chatbtn" type="button" onClick={toggleChat}>
                                    <i className="fa-solid fa-message" ></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>Chat</span>
                                </a>
                                {newEvent.organizerId === user.userdata._id ?
                                    <a className="btn text-light av" type="button" onClick={isRecording ? handleStopRecording : handleStartRecording}>
                                        <i className="bi bi-record-circle"></i><br />
                                        {isRecording ? <span style={{ fontSize: '1.5vh' }}>Stop Recording</span> : <span style={{ fontSize: '1.5vh' }}>Record</span>}
                                    </a>
                                    : <>
                                    </>
                                }
                                <a className="btn text-light av" type="button" onClick={toggleEmojiPicker} >
                                    <i className="fas fa-face-smile"></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>Reactions</span>
                                </a>
                                <a onClick={toggleQuesAns} className="btn text-light av" type="button">
                                    <i className="far fa-comments"></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>QnA</span>
                                </a>
                                <a className="btn text-light av" onClick={() => handleCopy(roomID)}>
                                    <i className="fas fa-copy"></i><br />
                                    <span style={{ fontSize: '1.5vh' }}>Copy ID</span>
                                </a>
                            </div>
                        </div>
                        <div className="col-lg-2 col-md-2 col-sm-0">
                            <a onClick={handleEndCall} className={`btn btn-danger text-light leave d-md-block ${showUserList || showChat || showEmojiPicker || showQuesAns ? 'd-none' : ''} `} type="button">Leave</a>
                        </div>
                    </nav>
                </div>
            }
            <ToastContainer />
        </>
    );
};

export default Meeting;
