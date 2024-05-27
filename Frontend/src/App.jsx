import Landing from "./Components/Landing/Landing"
import Login from "./Components/Login/login"
import Register from "./Components/Register/Register"
import Organization from "./Components/Organization/Organization"
import Dashboard from "./Components/Dashboard/Dashboard"
import Meeting from "./Components/Meeting/Meeting"
import ForgetPassword from './Components/ResetPass/ForgetPassword'
import ResetPass from './Components/ResetPass/ResetPass'
import Feedback from './Components/Feedback/Feedback'
import Schedule from './Components/Schedule/Schedule'
import MeetingHistory from "./Components/MeetingHistory/MeetingHistory"
import AnalyticsReport from './Components/Analytics/Analytics'

import { Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import { useEffect } from "react"
import axios from "axios"


function App() {
  const navigate = useNavigate();

  const location = useLocation();

  const pathsToExcludeFromAuthentication = [
    '*',
    '/',
    '/register',
    '/register/organization',
    '/login',
    '/reset',
    '/resetPass'
  ];

  const shouldCheckAuthentication = !pathsToExcludeFromAuthentication.includes(location.pathname);



  const checkAuthentication = async () => {
    try {
      const token = localStorage.getItem('token');
      const user = JSON.parse(localStorage.getItem("user"));
      if (!token || !user) {
        navigate('/login');
        return;
      }
      const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/verify`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.status === 200) {
        // console.log("User is authenticated");
      } else {
        navigate('/login');
      }
    } catch (error) {
      console.error('Error:', error);
      navigate('/login');
    }
  };

  useEffect(() => {
    if (shouldCheckAuthentication) {
      checkAuthentication();
    }
  }, [location.pathname]);



  return (
    <>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/register' element={<Register />} />
        <Route path='/register/organization' element={<Organization />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/meeting/:id' element={<Meeting />} />
        <Route path='/reset' element={<ForgetPassword />} />
        <Route path="/resetPass" element={<ResetPass />} />
        <Route path="/feedback" element={<Feedback />} />
        <Route path="/schedule" element={<Schedule />} />
        <Route path="/meetingHistory" element={<MeetingHistory />} />
        <Route path="/AnalyticsReport" element={<AnalyticsReport />} />
      </Routes>
    </>
  )
}

export default App;