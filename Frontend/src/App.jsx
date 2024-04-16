import Landing from "./Components/Landing/Landing"
import Login from "./Components/Login/login"
import Register from "./Components/Register/Register"
import Organization from "./Components/Organization/Organization"
import Dashboard from "./Components/Dashboard/Dashboard"
// import Meeting from "./components/Meeting/Meeting"
// import ResetPass from './components/ResetPass/Resetpass'
// import Chat from "./components/Chat/Chat"
import { Routes, Route } from 'react-router-dom'

function App() {


  return (
    <>
      <Routes>
        <Route path='/' element={<Landing />} />
        <Route path='/register' element={<Register />} />
        <Route path='/register/organization' element={<Organization />} />
        <Route path='/login' element={<Login />} />
        {/* <Route path='/Chat' element={<Chat />} /> */}
        <Route path='/dashboard' element={<Dashboard />} />


      </Routes> 
    </>
  )
}

export default App;