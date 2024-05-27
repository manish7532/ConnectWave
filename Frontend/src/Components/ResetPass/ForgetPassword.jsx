import logo from "../images/logo nav.png"
import { Link } from 'react-router-dom'
import axios from 'axios'
import { useNavigate } from "react-router-dom"
import { useState } from "react"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
function ForgetPassword() {
    const [email, setEmail] = useState('');
    const navigate = useNavigate()
    const handleresetform = async (e) => {
        e.preventDefault()
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/resetPass`, { email })
        try {
            if (response.status == 200) {
                const otp = response.data
                navigate('/resetPass', { state: { email: email, otp: otp } })
            }
            else {
                toast.error("User does not exists", {
                    position: "top-center"
                });
            }
        } catch (error) {
            toast.error("Something went wrong", {
                position: "top-center"
            });
            console.log(error)
        }
    }
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
                            <form className="resetform" onSubmit={handleresetform} style={formStyle} encType="multipart/form-data">
                                <h3 className="text-center mb-4">Password Reset</h3>
                                <h1 className="fs-6 text-secondary m-0">Provide the email address associated with your account to recover your password.</h1>
                                <div className="row">
                                    <div className="col-md-12 mb-2 mt-5">
                                        <label htmlFor="email" className="form-label">Email</label>
                                        <input type="email" name="email" value={email} onChange={e => setEmail(e.target.value)} className="form-control" required />
                                    </div>
                                    <div className="col-12">
                                        <button type="submit" className="btn btn-primary mt-2 form-control">Generete OTP</button>
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
export default ForgetPassword;