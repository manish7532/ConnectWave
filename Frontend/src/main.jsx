import ReactDOM from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter as Router } from 'react-router-dom'
import { SocketProvider } from '../src/Components/Socket/SocketContext'


ReactDOM.createRoot(document.getElementById('root')).render(
  <SocketProvider>
    <Router>
      <App />
    </Router>
  </SocketProvider>
)
