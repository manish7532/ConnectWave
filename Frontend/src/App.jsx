import Landing from "./Components/Landing/Landing"
import Login from "./Components/Login/login"
import Register from "./Components/Register/Register"
import Organization from "./Components/Organization/Organization"
import Dashboard from "./Components/Dashboard/Dashboard"
import Meeting from "./Components/Meeting/Meeting"
import ForgetPassword from './Components/ResetPass/ForgetPassword'
import ResetPass from './Components/ResetPass/ResetPass'
import { Routes, Route } from 'react-router-dom'

function App() {


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

      </Routes>
    </>
  )
}

export default App;