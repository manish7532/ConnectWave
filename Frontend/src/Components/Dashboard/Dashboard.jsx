import React from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import { useEffect } from 'react';
import './dashboard.css';
import logo from '../images/logo nav.png';

function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleJoinMeeting = () => {
    document.getElementById('modalcls').click()
    navigate('/meeting');
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

  useEffect(() => {
    const checkAuthentication = async () => {
      try {
        const token = localStorage.getItem('token');
        const user = JSON.parse(localStorage.getItem("user"));
        if (!token) {
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

    checkAuthentication();
  }, [navigate]);

  return (
    <div>

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
                <a className="nav-link" aria-current="page" href="#">
                  <i className="bi bi-house"></i>&nbsp;Home
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="#">
                  <i className="bi bi-camera-video"></i>&nbsp;Meetings
                </a>
              </li>

              <li className="nav-item dropdown">
                <a data-bs-toggle="dropdown" className="nav-icon nav-link pe-md-0">
                  {user && user.userdata.firstname}
                </a>
                <div className="dropdown-menu dropdown-menu-end">
                  <a href="#" className="dropdown-item">
                    Profile
                  </a>
                  <a href="#" className="dropdown-item">
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
                <Link to={"/meeting"} className="meet ctrls">
                  <i className="fas fa-video mb-2"></i>
                  <span className="label">New Meeting</span>
                </Link>
              </div>
              <div className="col-sm-6 mb-3">
                <a className="btn btn-lg btn-primary ctrls" data-bs-toggle="modal" data-bs-target="#exampleModal">
                  <i className="fas fa-plus mb-2"></i>
                  <span className="label">Join</span>
                </a>

                <div className="modal fade" id="exampleModal" tabIndex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
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
                            <input type="text" className="form-control mdalInp" id="meetingId" placeholder="Enter Meeting ID" />
                          </div>
                          <div className="mb-3">
                            <label htmlFor="username" className="mLabel">Username</label>
                            <input type="text" className="form-control mdalInp" id="username" placeholder="Enter Your Username" />
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
                <a href="#" className="btn btn-lg btn-primary ctrls">
                  <i className="far fa-calendar mb-2"></i>
                  <span className="label">Schedule</span>
                </a>
              </div>
              <div className="col-sm-6 mb-3">
                <a href="#" className="btn btn-lg btn-primary ctrls">
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

    </div>
  );
}

export default Dashboard;

