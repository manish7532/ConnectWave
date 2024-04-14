import Landing from "./components/Landing/Landing"
import Login from "./components/Login/login"
import Register from "./components/Register/Register"
import Organization from "./components/Organization/Organization"
import Dashboard from "./components/Dashboard/Dashboard"
import Meeting from "./components/Meeting/Meeting"
import ResetPass from './components/ResetPass/Resetpass'
import Chat from './components/Chat/Chat'
import { Routes, Route } from 'react-router-dom'

function App() {


  return (
    <>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/login' element={<Login />} />
        <Route path='/register' element={<Register />} />
        <Route path='/dashboard' element={<Dashboard />} />
        <Route path='/meeting' element={<Meeting />} />
        <Route path='/reset' element={<ResetPass />} />
        <Route path='/organization' element={<Organization />} />
        <Route path='/chat' element={<Chat />} />
      </Routes> 
      {/* <Login/>
      {/* <Dashboard /> */}
      
    </>
  )
}

export default App
