import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import logoimg from "../images/logo nav.png"
import './Schedule.css';
import { Link } from 'react-router-dom';
import { useNavigate } from 'react-router-dom'
import { Country } from 'country-state-city';
import axios from 'axios';

const ScheduleMeetingForm = () => {
    const [meetingTitle, setMeetingTitle] = useState('');
    const [description, setDescription] = useState('');
    const [countries, setCountries] = useState([]);
    const [meetingStartDate, setMeetingStartDate] = useState(null);
    const [meetingStartTime, setMeetingStartTime] = useState(null);
    const [meetingEndDate, setMeetingEndDate] = useState(null);
    const [duration, setDuration] = useState('');
    const [participants, setParticipants] = useState('');
    const [recordingsOption, setRecordingsOption] = useState(false);
    const [Q_AOption, setQ_AOption] = useState(false);
    const [waitingRoomOption, setWaitingRoomOption] = useState(false);
    const [selectedCountryIsoCode, setSelectedCountryIsoCode] = useState('IN');

    const user = JSON.parse(localStorage.getItem("user"));
    const navigate = useNavigate();

    useEffect(() => {
        const fetchedCountries = Country.getAllCountries();
        setCountries(fetchedCountries);
        setSelectedCountryIsoCode('IN');
    }, []);

    async function handleLogout() {
        try {
            // const response = await axios.get('http://192.168.39.79:8000/api/logout');
            // const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/logout`);
            console.log('Logged out successfully');
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        switch (name) {
            case 'meetingTitle':
                setMeetingTitle(value);
                break;
            case 'description':
                setDescription(value);
                break;
            case 'participants':
                setParticipants(value);
                break;
            case 'duration':
                setDuration(value);
                break;

            default:
                break;
        }
    };

    const handleDateChange = (date) => {
        setMeetingStartDate(date);
    };

    const handleEndDateChange = (date) => {
        setMeetingEndDate(date);
    };

    const handleTimeChange = (time) => {
        setMeetingStartTime(time);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!meetingStartDate || !meetingStartTime || !duration) {
            alert('Please select both start and end date and duration.');
            return;
        }


        const startDateTime = new Date(meetingStartDate);
        startDateTime.setHours(meetingStartTime.getHours());
        startDateTime.setMinutes(meetingStartTime.getMinutes());

        const endDateTime = new Date(startDateTime.getTime() + duration * 60000);
        const timeZone = Country.getCountryByCode(selectedCountryIsoCode).timezones[0].gmtOffsetName;

        const userID = user.userdata._id
        const EventformData = {
            userID,
            meetingTitle,
            description,
            participants,
            duration,
            recordingsOption,
            Q_AOption,
            waitingRoomOption,
            selectedCountryIsoCode,
            timeZone,
            meetingStartDate: startDateTime.toISOString(),
            meetingEndDate: endDateTime.toISOString()
        };

        try {
            // const response = await axios.post('https://192.168.39.79:8000/api/schedule', EventformData);
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/schedule`, EventformData);
            console.log('Meeting scheduled successfully:', response.data);
            console.log('Selected Country:', selectedCountryIsoCode);
            setMeetingTitle('');
            setDescription('');
            setMeetingStartDate(null);
            setMeetingStartTime(null);
            setMeetingEndDate(null);
            setDuration('');
            setSelectedCountryIsoCode('IN');
            setParticipants('');
            setRecordingsOption(false);
            setQ_AOption(false);
            setWaitingRoomOption(false);

            navigate('/dashboard')
        } catch (error) {
            console.error('Error scheduling meeting:', error);
            alert('Failed to schedule meeting. Please try again.');
        }

    };

    const [imgurl, setImgurl] = useState(``);
    useEffect(() => {
      if (user && user.userdata.profilePhoto) {
        setImgurl(`${import.meta.env.VITE_API_URL}/uploads/${user.userdata._id}/${user.userdata.profilePhoto}`)
      }
    }, [user])

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
                                    {imgurl && (
                                        <img src={imgurl} alt="" style={{ borderRadius: '50%', height: '4vh' }} />
                                    )}
                                    {!imgurl && (
                                        <i className="fa-regular fa-user"></i>
                                    )}

                                    &nbsp;{user && user.userdata.firstname}
                                </a>
                                <div className="dropdown-menu dropdown-menu-end">
                                    {/* <a className="dropdown-item" data-bs-toggle="modal" data-bs-target="#profileModal"> */}
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

            <div className="container d-flex justify-content-center mt-5">
                <form onSubmit={handleSubmit} className='row m-0 Schedule_page'>
                    <h3 className="text-center">Schedule Meeting</h3>
                    <div className="mb-3">
                        <label htmlFor="meetingTitle" className="form-label schedule_label">Meeting Title:</label>
                        <input type="text" className="finout" id="meetingTitle" name="meetingTitle" value={meetingTitle} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="description" className="form-label schedule_label">Description:</label>
                        <input type="text" className="finout" id="description" name="description" value={description} onChange={handleInputChange} required />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="participants" className="form-label schedule_label">Number of Participants:</label>
                        <input type="number" min={0} className="finout" id="participants" name="participants" value={participants} onChange={handleInputChange} required />
                    </div>

                    <div className="col-md-12 mb-2">
                        <label htmlFor="country" className="form-label">
                            Country
                        </label>
                        <select
                            className="form-select"
                            name="country"
                            aria-label="Default select example"
                            value={selectedCountryIsoCode}
                            onChange={(e) => setSelectedCountryIsoCode(e.target.value)}
                            required
                        >
                            {countries.map((country) => (
                                <option key={country.isoCode} value={country.isoCode}>
                                    {country.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="row mb-3">
                        <div className="col">
                            <label htmlFor="meetingStartDate" className="form-label schedule_label">Start Date:</label>
                            <div className="input-group">
                                <DatePicker
                                    id="meetingStartDate"
                                    selected={meetingStartDate}
                                    onChange={handleDateChange}
                                    dateFormat="MMMM d, yyyy"
                                    className="finout"
                                    required
                                    onKeyDown={(e) => e.preventDefault()}
                                    onFocus={(e) => e.target.blur()}
                                />

                            </div>
                        </div>
                        <div className="col">
                            <label htmlFor="meetingStartTime" className="form-label schedule_label">Start Time:</label>
                            <DatePicker
                                id="meetingStartTime"
                                selected={meetingStartTime}
                                onChange={handleTimeChange}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={5}
                                timeFormat="HH:mm"
                                dateFormat="h:mm aa"
                                className="finout"
                                required
                                onKeyDown={(e) => e.preventDefault()}
                                onFocus={(e) => e.target.blur()}
                            />
                        </div>
                    </div>
                    <div className="row mb-3">
                        <div className="col">
                            <label htmlFor="meetingEndDate" className="form-label schedule_label">End Date:</label>
                            <div className="input-group">
                                <DatePicker
                                    id="meetingEndDate"
                                    selected={meetingEndDate}
                                    onChange={handleEndDateChange}
                                    dateFormat="MMMM d, yyyy"
                                    className="finout"
                                    required
                                    onKeyDown={(e) => e.preventDefault()}
                                    onFocus={(e) => e.target.blur()}
                                />
                            </div>
                        </div>
                        <div className="col">
                            <label htmlFor="duration" className="form-label schedule_label">Duration (minutes):</label>
                            <input type="number" min={5} className="finout" id="duration" name="duration" value={duration} onChange={handleInputChange} required />
                        </div>
                    </div>


                    <div className="mb-3 ">
                        <label className="form-label">Additional Options:</label>
                        <div className='schedule_check'>
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="recordingsOption"
                                    checked={recordingsOption}
                                    onChange={() => setRecordingsOption(!recordingsOption)}
                                />
                                <label className="form-check-label schedule_label" htmlFor="recordingsOption">Recordings</label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input"
                                    id="Q_AOption"
                                    checked={Q_AOption}
                                    onChange={() => setQ_AOption(!Q_AOption)}
                                />
                                <label className="form-check-label" htmlFor="Q_AOption">Q&A</label>
                            </div>
                            <div className="form-check">
                                <input
                                    type="checkbox"
                                    className="form-check-input "
                                    id="waitingRoomOption"
                                    checked={waitingRoomOption}
                                    onChange={() => setWaitingRoomOption(!waitingRoomOption)}
                                />
                                <label className="form-check-label schedule_label" htmlFor="waitingRoomOption"> Waiting Room</label>
                            </div>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary w-100">Schedule Meeting</button>
                </form>

            </div>
        </>
    );
};

export default ScheduleMeetingForm;
