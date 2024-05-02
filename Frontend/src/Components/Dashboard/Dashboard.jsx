import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import './dashboard.css';
import logo from '../images/logo nav.png';
import { v4 as uuid } from 'uuid'
import { Country } from 'country-state-city';

function Dashboard() {
  const [roomID, setRoomID] = useState();
  const navigate = useNavigate();

  const handleJoinMeeting = () => {
    document.getElementById('modalcls').click()
    navigate('/meeting/' + roomID);
  };

  async function handleLogout() {
    try {
      const response = await axios.get('http://localhost:8000/api/logout');
      console.log('Logged out successfully');
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem("user"));
      if (!token || !user) {
        navigate('/login');
        return;
      }

      const response = await axios.get('http://localhost:8000/api/verify', {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        console.log("User is authenticated");
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    }
  };
  
  useEffect(() => {

    setTimeout(() => {
      checkAuthentication();
    }, '5000')

  }, []);



  // -------------------------------new Meeting-----------------------------------

  const handleNewMeeting = () => {
    const newRoomId = uuid();
    navigate('/meeting/' + newRoomId);
  }






  // --------------------------profile update--------------------------------
  const user = JSON.parse(localStorage.getItem("user"));
  const [data, setData] = useState({
    firstname: user.userdata.firstname,
    lastname: user.userdata.lastname,
    email: user.userdata.email,
    country: user.userdata.country,
    type: user.userdata.type
  })


  const [profilePhoto, setProfilePhoto] = useState(user.userdata.profilePhoto);
  const [countries, setCountries] = useState([]);


  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
    setData((prevData) => ({
      ...prevData,
      country: 'AFG',
      type: 'Individual',
    }));
  }, []);



  return (
    <>
      {/* <div> */}

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
            <ul className="navbar-nav mb-2 mb-lg-0">
              <li className="nav-item">
                <a className="nav-link" aria-current="page">
                  <i className="bi bi-house"></i>&nbsp;Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link">
                  <i className="bi bi-camera-video"></i>&nbsp;Meetings
                </a>
              </li>

              <li className="nav-item dropdown">
                <a data-bs-toggle="dropdown" className="nav-icon nav-link pe-md-0">
                  {user && user.userdata.firstname}
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a className="dropdown-item" data-bs-toggle="modal" data-bs-target="#profileModal">
                    Profile
                  </a>












                  <a className="dropdown-item">
                    Setting
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

                <div className="modal fade" id="exampleModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
                          {/* <div className="mb-3">
                            <label htmlFor="username" className="mLabel">Username</label>
                            <input type="text" className="form-control mdalInp" id="username" placeholder="Enter Your Username" />
                          </div> */}
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
                <a className="btn btn-lg btn-primary ctrls">
                  <i className="far fa-calendar mb-2"></i>
                  <span className="label">Schedule</span>
                </a>
              </div>
              <div className="col-sm-6 mb-3">
                <a className="btn btn-lg btn-primary ctrls">
                  <i className="fas fa-arrow-up mb-2"></i>
                  <span className="label">Share Screen</span>
                </a>
              </div>
            </div>
          </div>
          <div className="col-sm-12 col-md-4 scheduled-events">
            <p className="text-center">Scheduled Events</p>
          </div>
        </div>
      </div>

      {/* --------------------------------------profile Modal----------------------------------------- */}
      <div className="modal fade" id="profileModal" aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="modal-title" id="exampleModalLabel">Profile</h3>
              <button type="button" className="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div className="modal-body">
              <form>
                <div className="mb-3">
                  <label className="mLabel"> First Name</label>
                  <input type="text" className="form-control mdalInp" placeholder="Enter first name" value={data.firstname} onChange={(e) => setData({ ...data, firstname: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="mLabel"> Last Name</label>
                  <input type="text" className="form-control mdalInp" placeholder="Enter last name" value={data.lastname} onChange={(e) => setData({ ...data, lastname: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="mLabel"> Email</label>
                  <input type="email" className="form-control mdalInp" placeholder="Enter email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required />
                </div>
                <div className="mb-3">
                  <label className="mLabel"> Country</label>
                  <input type="text" className="form-control mdalInp" value={data.country} disabled readOnly />
                </div>
                <div className="mb-3">
                  <label className="mLabel"> Account Type</label>
                  <input type="text" className="form-control mdalInp" value={data.type} disabled readOnly />
                </div>
                <div className="mb-3">
                  <label className="mLabel"> Profile Photo</label>
                  {/* <input type="file" className="form-control mdalInp" value={profilePhoto} /> */}
                </div>
              </form>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-secondary" id='modalcls' data-bs-dismiss="modal">Close</button>
              <button type="button" className="btn btn-primary" >Update Profile</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Dashboard;

