import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { useEffect, useState, useRef } from 'react';
import './dashboard.css';
import logo from '../images/logo nav.png';
import { DateTime } from 'luxon';
import copy from 'clipboard-copy';
import CalendarClock from './CalendarClock';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';


function Dashboard() {
  const [scheduledMeetings, setScheduledMeetings] = useState([]);
  const [roomID, setRoomID] = useState();
  const navigate = useNavigate();
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("user")));
  const Schedule_eventRef = useRef(null);
  const btn_submit = useRef(null);


  const handleJoinMeeting = async () => {
    document.getElementById('modalcls').click()
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/getEvent`, { roomID: roomID })
      if (response.status == 201) {
        navigate('/meeting/' + roomID, { state: { roomID: roomID, event: response.data.event } });
      }
      else {
        toast.error('Event Not Found', {
          position: "top-center"
        });
      }
      setRoomID();
    } catch (error) {
      toast.error('Event Not Found', {
        position: "top-center"
      });
      setRoomID('');
    }
  };


  const fetchScheduledMeetings = async () => {
    try {
      if (!user) return;
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/smeetings`,

        {
          params: {
            organizerId: user.userdata._id
          }
        });
      setScheduledMeetings(response.data.meetings);
    } catch (error) {
      console.error('Error fetching meetings:', error);
    }
  };

  useEffect(() => {
    fetchScheduledMeetings();
  }, []);

  useEffect(() => {
    if (Schedule_eventRef.current) {
      Schedule_eventRef.current.scrollTop = Schedule_eventRef.current.scrollHeight;
    }
  }, [scheduledMeetings]);

  function calculateTimeUntilStart(startDateTime, endDateTime) {
    const now = new Date();
    const startTime = new Date(startDateTime);
    const endTime = new Date(endDateTime);

    if (now >= endTime) {
      return { hasStarted: true, hasEnded: true };
    }

    if (now >= startTime) {
      const diff = endTime - now;
      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff / (1000 * 60)) % 60);
      return {
        hours: hours,
        minutes: minutes,
        hasStarted: true,
        hasEnded: false
      };
    }

    const diff = startTime - now;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff / (1000 * 60)) % 60);

    return {
      hours: hours,
      minutes: minutes,
      hasStarted: false,
      hasEnded: false
    };
  }

  useEffect(() => {
    const interval = setInterval(() => {
      setScheduledMeetings((prevMeetings) =>
        prevMeetings.map((meeting) => ({
          ...meeting,
          timeUntilStart: calculateTimeUntilStart(meeting.startDate, meeting.endDate),
        })).filter((meeting) => !meeting.timeUntilStart.hasEnded)
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);



  const formatDateTime = (dateTimeString) => {
    try {
      const d = DateTime.fromISO(dateTimeString);

      if (!d.isValid) {
        return '';
      }

      if (d.hasSame(DateTime.local(), 'day')) {
        return d.toLocaleString(DateTime.TIME_SIMPLE);
      } else {
        return d.toLocaleString(DateTime.DATETIME_MED);
      }
    } catch (error) {
      console.error('Error parsing date:', error);
      return '';
    }
  };

  //------------log out------------------------
  async function handleLogout() {
    try {
      console.log('Logged out successfully');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }


  // -------------------------------new Meeting-----------------------------------

  const handleNewMeeting = async () => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/event`, { userID: user.userdata._id })
      navigate('/meeting/' + response.data.event._id, { state: { roomID: response.data.event._id, event: response.data.event } });
    } catch (error) {
      console.log(error);
    }
  }



  // ---------start scheduled meeting-----------------
  const handleStartMeeting = async (id) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/getEvent`, { roomID: id })
      navigate('/meeting/' + id, { state: { roomID: id, event: response.data.event } });
    } catch (error) {
      console.log(error);
    }
  };

  // ---------------------copy meeting link--------------------------
  const handleCopyMeetingId = (id) => {
    try {
      copy(id);
      console.log('Meeting ID copied to clipboard:', id);
    } catch (error) {
      console.error('Failed to copy Meeting ID:', error);
    }
  };

  //----------------------delete event---------------------
  const handleDeleteEvent = async (id) => {
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/deleteEvent`, { id });
      console.log('Event deleted successfully:', response.data);
      setScheduledMeetings((prevMeetings) => prevMeetings.filter((meeting) => meeting._id !== id));
    } catch (error) {
      console.error('Error deleting event:', error);
    }
  };




  const [imgurl, setImgurl] = useState(``);
  useEffect(() => {
    if (user && user.userdata.profilePhoto) {
      setImgurl(`${import.meta.env.VITE_API_URL}/uploads/${user.userdata._id}/${user.userdata.profilePhoto}`)
    }
  }, [user])


  //------------ offcanvas profile update--------------------
  const [data, setData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    type: '',
  })

  const [profilePhoto, setProfilePhoto] = useState('');


  useEffect(() => {
    if (user) {
      setData((prevData) => ({
        ...prevData,
        firstname: user.userdata.firstname,
        lastname: user.userdata.lastname,
        email: user.userdata.email,
      }));
    }
  }, [user]);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
  };

  useEffect(() => {
    if (profilePhoto !== '') {
      btn_submit.current.click();
    }
  }, [profilePhoto])



  // ------ update profile photo --------
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!profilePhoto) {
      alert('Please select a profile photo to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('userID', user.userdata._id);
    formData.append('profilePhoto', profilePhoto);
    try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/profilePhoto`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      if (response.status === 200) {
        toast.success("Profile photo updated successfully", {
          position: "top-center"
        });
        localStorage.setItem("user", JSON.stringify({ userdata: response.data.user }));
        setProfilePhoto('');
        setUser(JSON.parse(localStorage.getItem("user")))
      }
    } catch (error) {
      console.error('Error uploading profile photo:', error);
      toast.error('Error uploading profile photo', {
        position: "top-center"
      });
    }
  };




  return (
    <>
      <nav className="navbar navbar-expand-lg text-light dnav" data-bs-theme="dark">
        <div className="container-fluid">
          <div className="d-flex align-items-center">
            <div className="logo">
              <img src={logo} height="40vh" alt="ConnectWave Logo" />
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
            <ul className="navbar-nav mb-2 mb-lg-0 align-items-center">

              <li className="nav-item">
                <Link to={'/AnalyticsReport'} className="nav-link" >
                  <i height='4vh' className="fa fa-pie-chart" aria-hidden="true" ></i>&nbsp;Report
                </Link>
              </li>

              <li className="nav-item dropdown">
                <a data-bs-toggle="dropdown" className="nav-icon nav-link pe-md-0">
                  {imgurl && (
                    <img src={imgurl} alt="" style={{ borderRadius: '50%', height: '4vh' }} />
                  )}
                  {!imgurl && (
                    <i className="fa-regular fa-user"></i>
                  )}

                  &nbsp;{user && user.userdata.firstname}
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#profileCanvas" aria-controls="offcanvasRight">
                    Profile
                  </a>
                  <a className="dropdown-item" onClick={handleLogout}>
                    Logout
                  </a>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </nav>

      <div className="container-fluid main" style={{ color: 'white' }}>
        <div className="row">
          <div className="col-sm-12 col-md-8 d-flex justify-content-center align-items-center">
            <div className="row">
              <div className="col-sm-6 mb-3">
                <a onClick={handleNewMeeting} className="meet ctrls">
                  <i className="fas fa-video mb-2"></i>
                  <span className="label">New Meeting</span>
                </a>
              </div>
              <div className="col-sm-6 mb-3">
                <a className="btn btn-lg btn-primary ctrls" data-bs-toggle="modal" data-bs-target="#exampleModal">
                  <i className="fas fa-plus mb-2"></i>
                  <span className="label">Join</span>
                </a>

                <div className="modal  fade" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
                  <div className="modal-dialog">
                    <div className="modal-content">
                      <div className="modal-header">
                        <h3 className="modal-title" id="exampleModalLabel">Join a Meeting</h3>
                        <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                      </div>
                      <div className="modal-body">
                        <form>
                          <div className="mb-3">
                            <label htmlFor="meetingId" className="mLabel">Meeting ID</label>
                            <input type="text" value={roomID} onChange={e => setRoomID(e.target.value)} className="form-control mdalInp" id="meetingId" placeholder="Enter Meeting ID" />
                          </div>
                        </form>
                      </div>
                      <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" id='modalcls' data-bs-dismiss="modal">Close</button>
                        <button type="button" className="btn btn-primary" onClick={handleJoinMeeting} >Join</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="col-sm-6 mb-3">
                <Link to={'/schedule'} className="btn btn-lg btn-primary ctrls">
                  <i className="far fa-calendar mb-2"></i>
                  <span className="label">Schedule</span>
                </Link>
              </div>
              <div className="col-sm-6 mb-3">
                <Link to={'/meetingHistory'} className="btn btn-lg btn-primary ctrls">

                  <i className="fas fa-history"></i>
                  <span className="label">Meetings</span>
                </Link>

              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-4 scheduled-events calendar-clock-wrapper" style={{ overflowY: 'auto', scrollbarWidth: "none" }}>
            <CalendarClock />
            <h5 className="text-center text-primary mt-2 justify-content-center">Scheduled Events</h5>

            <ul className='ps-0' ref={Schedule_eventRef} style={{ overflowY: "auto", scrollbarWidth: "none" }}>
              {scheduledMeetings
                .filter((meeting) => meeting.organizerId === user.userdata._id)
                .map((meeting) => (
                  <li key={meeting._id} className='schedule_list1 p-2 mb-2'>
                    <div className='d-flex justify-content-between'>
                      <h5>Title: {meeting.title}</h5>

                      <span className="nav-item dropdown d-flex gap-2" data-bs-theme='dark'>
                        <button onClick={() => handleStartMeeting(meeting._id)} className='btn btn-sm btn-primary'>start</button>
                        <a data-bs-toggle="dropdown" className="nav-icon nav-link pe-md-0">
                          <i className="bi bi-three-dots"></i>
                        </a>
                        <div className="dropdown-menu dropdown-menu-end">
                          <a className="dropdown-item" onClick={() => handleCopyMeetingId(meeting._id)}>
                            Copy ID
                          </a>
                          <a className="dropdown-item" onClick={() => handleDeleteEvent(meeting._id)}>
                            Delete Event
                          </a>
                        </div>
                      </span>

                    </div>
                    <p className='se'>Start Time: {formatDateTime(meeting.startDate)} : {formatDateTime(meeting.endDate)}</p>
                    <p className='se'>
                      Starts in:{' '}
                      {meeting.timeUntilStart && !meeting.timeUntilStart.hasStarted ? (
                        `${meeting.timeUntilStart.hours} hours ${meeting.timeUntilStart.minutes} minutes`
                      ) : (
                        'Meeting has started'
                      )}
                    </p>
                  </li>
                ))}
            </ul>
          </div>
        </div>
      </div>



      {/* ----------------------profile canvas----------------------------- */}
      <div className="offcanvas offcanvas-end" data-bs-theme='dark' tabIndex="-1" id="profileCanvas">
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">Profile</h5>
          <button type="button" className="btn-close" data-bs-dismiss="offcanvas" aria-label="Close"></button>
        </div>
        <div className="offcanvas-body" style={{ overflowY: "auto", scrollbarWidth: "none" }}>

          {/* ---------------------profile photo update--------------------- */}
          <form onSubmit={handleProfileUpdate} encType="multipart/form-data">
            <span className="d-flex justify-content-center" style={{ height: '25vh' }}>
              {imgurl && (
                <img src={imgurl} alt="" style={{ borderRadius: '50%' }} />
              )}
              {!imgurl && (<>
                <i className="fa-regular fa-user fa-6x" style={{ borderRadius: '50%', padding: '5vh', border: '.1px solid #1d1d21' }}></i>&nbsp;
              </>
              )}
            </span>
            <input type="file" id="fileInput" accept='image/*' hidden name="profilePhoto" className="form-control" onChange={(e) => handleFileChange(e)} />
            <span className="d-flex justify-content-center align-items-center gap-1 mt-2" style={{ cursor: 'pointer' }} onClick={() => { document.getElementById('fileInput').click() }}><i className="fas fa-edit"></i>Edit</span>
            <button type="submit" hidden ref={btn_submit}></button>
          </form>


          {/* -------------------------profile details update-------------------- */}
          <form>
            <div className="row">
              <div className="col-md-12 mb-2">
                <label htmlFor="firstName" className="form-label">
                  First Name
                </label>
                <input type="text" name="firstname" className="form-control" value={data.firstname} onChange={(e) => setData({ ...data, firstname: e.target.value })} disabled />
              </div>
              <div className="col-md-12 mb-2">
                <label htmlFor="lastName" className="form-label">
                  Last Name
                </label>
                <input type="text" name="lastname" className="form-control" value={data.lastname} onChange={(e) => setData({ ...data, lastname: e.target.value })} disabled />
              </div>
              <div className="col-md-12 mb-2">
                <label htmlFor="email" className="form-label">
                  Email
                </label>
                <input type="email" name="email" className="form-control" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} disabled />
              </div>

            </div>
          </form>
        </div>
      </div>


      <ToastContainer />

    </>
  );
}

export default Dashboard;

