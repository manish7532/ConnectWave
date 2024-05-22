import logoimg from "../images/logo nav.png"
import '../Schedule/Schedule.css';
import { Link } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import './meetingHistory.css'


function MeetingHistory() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"));
    const [meetings, setMeetings] = useState([]);

    async function handleLogout() {
        try {
            // const response = await axios.get('https://192.168.39.79:8000/api/logout');
            // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/logout`);
            console.log('Logged out successfully');
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    const getMyMeetings = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/getMyMeetings`, { userID: user.userdata._id });
            const eventData = response.data.meetings.map(async (meeting) => {
                const fb = await axios.post(`${import.meta.env.VITE_API_URL}/api/getAnalytics`, { roomID: meeting.eventID });
                const ev = await axios.post(`${import.meta.env.VITE_API_URL}/api/getEvent`, { roomID: meeting.eventID });
                const d = new Date(meeting.joinedAt)
                const d1 = new Date(meeting.leftAt)
                ev.data.event.successRate = fb.data.successRate;
                ev.data.event.successRatecolor = fb.data.successRatecolor;
                ev.data.event.joinedAt = d.toString();
                ev.data.event.leftAt = d1.toString();
                ev.data.event.duration = parseInt(meeting.duration);
                ev.data.event.role = meeting.role;
                return ev.data.event;
            });
            const resolvedEvents = await Promise.all(eventData);
            setMeetings(resolvedEvents);
        } catch (error) {
            console.log(error)
        }
    }

    useEffect(() => {
        getMyMeetings();
    }, [])


    return (
        <>
            <nav className="navbar navbar-expand-lg text-light dnav" style={{ backgroundColor: "#001247" }} data-bs-theme="dark">
                <div className="container-fluid">
                    <div className="d-flex align-items-center">
                        <div className="logo">
                            <img src={logoimg} height="40vh" alt="ConnectWave Logo" />
                        </div>
                        <h5 className="mt-2 ms-2">ConnectWave</h5>
                    </div>
                    <button
                        className="navbar-toggler"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target="#navbarSupportedContent"
                        aria-controls="navbarSupportedContent"
                        aria-expanded="false"
                        aria-label="Toggle navigation"
                    >
                        <span className="navbar-toggler-icon"></span>
                    </button>

                    <div className="collapse navbar-collapse justify-content-end" id="navbarSupportedContent">
                        <ul className="navbar-nav mb-2 mb-lg-0">
                            <li className="nav-item">
                                <Link to={'/dashboard'} className="nav-link" aria-current="page">
                                    <i className="bi bi-house"></i>&nbsp;Home
                                </Link>
                            </li>

                            <li className="nav-item dropdown">
                                <div className="dropdown-menu dropdown-menu-end">
                                    <a className="dropdown-item" onClick={handleLogout}>
                                        Logout
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container d-flex flex-column align-items-center justify-content-center mt-5" >
                <h3 className="text-center">Meeting Records</h3>
                {meetings.map((meeting, index) => (
                    <div key={index} className="eventCard card m-2" data-bs-theme='dark' >
                        <div className="card-body">
                            <h4 className="card-title">{meeting.title}</h4>
                            {/* <p className="card-text">EventId: {meeting._id}</p> */}
                            <p className="card-text">Role: {meeting.role}</p>
                            <p className="card-text">Joined at: {meeting.joinedAt}</p>
                            <p className="card-text">Left at: {meeting.leftAt}</p>
                            <p className="card-text">Attended Duration: {meeting.duration} {meeting.duration <= 1 ? 'minute' : 'minutes'}</p>
                            {meeting.role == 'host' ? (meeting.successRate ? <p>Success Rate: <span style={{ color: `${meeting.successRatecolor}` }}>{meeting.successRate}</span></p> : <p>Success Rate: There are no feedbacks to determine success rate </p>) : <></>}
                        </div>
                    </div>
                ))}
            </div>
        </>
    )
}

export default MeetingHistory;