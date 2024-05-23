import logoimg from "../images/logo nav.png"
import { Link } from 'react-router-dom';
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { Bar } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);


function AnalyticsReport() {
    const navigate = useNavigate()
    const user = JSON.parse(localStorage.getItem("user"));
    const [successRates, setSuccessRates] = useState({});

    async function handleLogout() {
        try {
            const response = await axios.get(`${import.meta.env.VITE_API_URL}/api/logout`);
            console.log('Logged out successfully');
            localStorage.removeItem("token");
            localStorage.removeItem("user");
            navigate('/login');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    const getMyMeetings = async () => {
        try {
            const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/getMyMeetings`, { userID: user.userdata._id });
            const eventData = response.data.meetings.map(async (meeting) => {
                const fb = await axios.post(`${import.meta.env.VITE_API_URL}/api/getAnalytics`, { roomID: meeting.eventID });
                const ev = await axios.post(`${import.meta.env.VITE_API_URL}/api/getEvent`, { roomID: meeting.eventID });
                ev.data.event.successRate = fb.data.successRate;
                ev.data.event.role = meeting.role;

                return ev.data.event;
            });
            const resolvedEvents = await Promise.all(eventData);

            // Calculate success rates for chart
            const rates = resolvedEvents.reduce((acc, meeting) => {
                if (meeting.role === 'host') {
                    acc[meeting.successRate] = (acc[meeting.successRate] || 0) + 1;
                }
                return acc;
            }, {});

            setSuccessRates(rates);
        } catch (error) {
            console.log(error)
        }
    }


    useEffect(() => {
        getMyMeetings();
    }, [])

    const labelColors = {
        'Very Good': ' rgba(0, 255, 119, 0.575)',
        'Good': 'rgba(75, 192, 192,0.4)',
        'Average': 'rgba(255, 205, 86,0.4)',
        'Poor': 'rgba(254, 150, 47,0.4)',
        'very Poor': 'rgba(255, 99, 132,0.4)',
        'undefined': 'rgba(102, 103, 108, 0.54)'
    };
    const borderColors = {
        'Very Good': ' rgb(0, 255, 119)',
        'Good': 'rgb(75, 192, 192)',
        'Average': 'rgb(255, 205, 86)',
        'Poor': 'rgb(254, 150, 47)',
        'very Poor': 'rgb(255, 99, 132)',
        'undefined': 'rgb(102, 103, 108)'
    };
    // Prepare data for the chart
    const data = {
        labels: Object.keys(successRates),
        datasets: [
            {
                label: 'Success Rate',
                data: Object.values(successRates),
                backgroundColor: Object.keys(successRates).map(label => labelColors[label]),
                borderColor: Object.keys(successRates).map(label => borderColors[label]),
                borderWidth: 2
            }],

    };



    const options = {
        maintainAspectRatio: false,
        scales: {
            x: {
                title: {
                    display: true,
                    text: 'Success Rate', // X-axis label
                    color: 'white',
                    font: {
                        size: 20,
                    },
                },
                ticks: {
                    color: 'white',
                    font: {
                        size: 14,
                    },
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
            y: {
                beginAtZero: true,
                title: {
                    display: true,
                    text: 'Number of Meetings', // Y-axis label
                    color: 'white',
                    font: {
                        size: 20,
                    },
                },
                ticks: {
                    color: 'white',
                    font: {
                        size: 14,
                    },
                },
                grid: {
                    color: 'rgba(255, 255, 255, 0.2)',
                },
            },
        },
        plugins: {
            legend: {
                display: false,
            },
        },
    };


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

                            <li className="nav-item dropdown">
                                <div className="dropdown-menu dropdown-menu-end">
                                    <a className="dropdown-item" onClick={handleLogout}>
                                        Logout
                                    </a>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            <div className="container d-flex flex-column align-items-center justify-content-center mt-5" >
                {/* <h3 className="text-center">Analytics Report</h3> */}

                <div className="mt-5" style={{ width: '80%', height: '450px' }}>
                    <h3 className="text-center">Success Rate Distribution</h3>
                    <Bar data={data} options={options} />
                </div>
            </div>
        </>
    )
}

export default AnalyticsReport;