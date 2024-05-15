import { useNavigate, useLocation } from "react-router-dom";
import { Link } from 'react-router-dom'
import logo from "../images/logo nav.png"
import axios from 'axios'
import { useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function ResetPass() {
    const navigate = useNavigate()
    const { state } = useLocation()
    const { email, otp } = state;
    const [userOtp, setUserOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (newPassword == confirmPassword && otp.otp == userOtp) {
                const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/changePass`, {
                    email,
                    newPassword,
                });
                if (response.status === 200) {
                    alert('Password has been reset successfully.');
                    navigate('/login');
                }
            }
            else {
                toast.error("OTP Or Password not matched", {
                    position: "top-center"
                });
            }
        } catch (error) {
            toast.error("Something went wrong", {
                position: "top-center"
            });
            console.log(error)
            setConfirmPassword('')
            setNewPassword('')
            setUserOtp('')
        }
    };
    const containerStyle = {
        minHeight: '100vh',
        margin: '0px',
        fontFamily: 'Poppins',
        backgroundColor: '#001247',
        color: 'black'
    };
    const formStyle = {
        backgroundColor: 'white',
        padding: '50px',
        borderRadius: '1cap',
    };
    const linkStyle = {
        color: 'white',
        textDecoration: 'none',
        fontWeight: 'bold',
        transition: '.3s all ease',
    };
    return (
        <>
            <div style={containerStyle}>
                <div className="row m-0 text-light">
                    <div className="col-8">
                        <h5 className="text-light">
                            <img src={logo} height="50vh" alt="logo" /> ConnectWave
                        </h5>
                    </div>
                    <div className="col-4 mt-2 d-flex justify-content-end">
                        <Link to={"/login"} style={linkStyle}>Sign In</Link>
                    </div>
                </div>
                <div className="container-fluid mt-4 mb-4">
                    <div className="row justify-content-center align-items-center">
                        <div className="col-lg-5 col-md-8 col-sm-10">
                            <form className="resetform" onSubmit={handleSubmit} style={formStyle} encType="multipart/form-data">
                                <h3 className="text-center mb-4">Password Reset</h3>
                                <div className="row">
                                    <div className="col-md-12 mb-2 mt-5">
                                        <label htmlFor="otp" className="form-label">OTP</label>
                                        <input type="text" value={userOtp} onChange={e => setUserOtp(e.target.value)} className="form-control" required />
                                    </div>
                                    <div className="col-md-12 mb-2 ">
                                        <label htmlFor="newPassword" className="form-label">New Password</label>
                                        <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="form-control" required />
                                    </div>
                                    <div className="col-md-12 mb-2 ">
                                        <label htmlFor="confirmPassword" className="form-label">Confirm Password</label>
                                        <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="form-control" required />
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary mt-2 form-control">Reset Password</button>
                                    </div>
                                  
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}
export default ResetPass;






