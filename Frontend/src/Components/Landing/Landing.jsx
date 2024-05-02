import logo from "../images/logo nav.png"
import img from "../images/image.png"
import './landing.css'
import { Link } from "react-router-dom"
function Landing() {

  return (
    <>
      <header className="header">
        <nav className="navbar lnav">
          <div className="logo d-flex">
            <img src={logo} height="50vh" alt="logo" />
            <h4 className="mt-2">ConnectWave</h4>
          </div>
          <input type="checkbox" id="menu-toggle" />
          <label htmlFor="menu-toggle" id="hamburger-btn">
            <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
          </label>
          <ul className="links">
            <li>
              <Link to={"/login"} className="signin">Sign In</Link>
            </li>
            <li>
              <Link to={"/register"} className="signup">Sign Up</Link>
            </li>
          </ul>
        </nav>
      </header>
      <section className="hero-section">
        <div className="hero">
          <h1>ConnectWave</h1>
          <p>
            Improve your connections, no matter your location.
            Our work doesn&apos;t stop, neither should your communication.
          </p>
          {/* <div className="buttons" >
            <a className="join" style={{ cursor: "pointer" }} data-bs-toggle="modal" data-bs-target="#exampleModal">Join Now</a>
          </div> */}

          {/* Modal */}
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
                  <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                  <button type="button" className="btn btn-primary">Join</button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="img">
          <img src={img} alt="hero image" />
        </div>
      </section>
    </>
  )
}
export default Landing;




















