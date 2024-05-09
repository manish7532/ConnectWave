import { useState } from 'react';
import './Feedback.css';
import axios from 'axios';
import { Link } from 'react-router-dom';
import logoimg from '../images/logo nav.png'
import { useNavigate } from 'react-router-dom'
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Feedback = () => {

    let params = new URLSearchParams(window.location.search);
    let roomID = params.get('roomID');
    const [selectedRatings, setSelectedRatings] = useState(null);
    const [selected_ARatings, setSelected_ARatings] = useState(null);
    const [selected_VRatings, setSelected_VRatings] = useState(null);
    const [suggestion, setSuggestion] = useState('');
    const navigate = useNavigate();

    const user = JSON.parse(localStorage.getItem("user"));

    const handleRatingClick = (value) => {
        setSelectedRatings(value === selectedRatings ? null : value);
    };

    const handle_ARatingClick = (value) => {
        setSelected_ARatings(value === selected_ARatings ? null : value);
    };

    const handle_VRatingClick = (value) => {
        setSelected_VRatings(value === selected_VRatings ? null : value);
    };

    const handleSuggestionsChange = (event) => {
        setSuggestion(event.target.value);
    };

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            // console.log(user.userdata._id)
            const response = await axios.post('https://localhost:8000/api/feedback', {
                eventID: roomID,
                userID: user.userdata._id,
                rating: selectedRatings,
                audioQuality: selected_ARatings,
                videoQuality: selected_VRatings,
                suggestion: suggestion
            });
            console.log(response.data);
            if (response.data.status === 201) {
                setSelectedRatings([]);
                setSelected_ARatings([]);
                setSelected_VRatings([]);
                setSuggestion('');
                navigate('/dashboard')
            }
            else {
                toast.error(response.data.message, { position: 'top-center' })
            }

        } catch (error) {
            console.error('Failed to submit feedback:', error);
            toast.error('Ratings are required', { position: 'top-center' })
        }

    };

    async function handleLogout() {
        try {
            const response = await axios.get('https://localhost:8000/api/logout');
            console.log('Logged out successfully');
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    const imgurl = `https://localhost:8000/uploads/${user.userdata._id}/${user.userdata.profilePhoto}`
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
                            {/* <li className="nav-item">
                <a className="nav-link">
                  <i className="bi bi-camera-video"></i>&nbsp;Meetings
                </a>
              </li> */}

                            <li className="nav-item dropdown">
                                <a data-bs-toggle="dropdown" className="nav-icon nav-link pe-md-0">
                                    {user.userdata.profilePhoto ? <img src={imgurl} alt="" style={{ borderRadius: '50%', height: '4vh' }} /> :
                                        <i className="fa-regular fa-user"></i>}&nbsp;{user && user.userdata.firstname}
                                </a>
                                <div className="dropdown-menu dropdown-menu-end">
                                    <a className="dropdown-item" data-bs-toggle="offcanvas" data-bs-target="#profileCanvas" aria-controls="offcanvasRight">
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
            <div className="page-container col-sm-12">
                <div className="feedback-container">
                    <form onSubmit={handleSubmit}>
                        <h2 className='text-center mb-4'>Feedback Form</h2>

                        <h6 className='heading_feedback'>Audio Quality:</h6>
                        <div className="rating-buttons">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    className={`rating-button ${selected_ARatings === value ? 'selected' : ''}`}
                                    onClick={() => handle_ARatingClick(value)}
                                    type="button"
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        <h6 className='heading_feedback'>Video Quality:</h6>
                        <div className="rating-buttons">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    className={`rating-button ${selected_VRatings === value ? 'selected' : ''}`}
                                    onClick={() => handle_VRatingClick(value)}
                                    type="button"
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        <h6 className='heading_feedback'>Overall Rating:</h6>
                        <div className="rating-buttons">
                            {[1, 2, 3, 4, 5].map((value) => (
                                <button
                                    key={value}
                                    className={`rating-button ${selectedRatings === value ? 'selected' : ''}`}
                                    onClick={() => handleRatingClick(value)}
                                    type="button"
                                >
                                    {value}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label htmlFor="suggestion">Suggestions:</label>
                            <textarea
                                id="suggestion"
                                name="suggestion"
                                value={suggestion}
                                onChange={handleSuggestionsChange}
                                placeholder="Type your suggestion here..."
                            />
                        </div>

                        <div>
                            <button type="submit">Submit</button>
                        </div>
                    </form>
                </div>
            </div>
            <ToastContainer/>
        </>
    );
};

export default Feedback;
