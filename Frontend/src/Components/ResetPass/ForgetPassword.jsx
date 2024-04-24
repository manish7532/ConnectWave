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
        const response = await axios.post('http://localhost:3000/api/resetPass', { email })
        try {
            if (response.status == 200) {
                const otp = response.data
                navigate('/ResetPass', { state: { email: email, otp: otp } })
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
                                    {/* <div className="row">
                                        <div className="col-12">
                                            <p className="mt-5 mb-4">Or sign in with</p>
                                            <div className="d-flex gap-3 flex-column flex-xl-row">
                                                <a href="#!" className="btn bsb-btn-xl btn-outline-primary">
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" className="bi bi-google" viewBox="0 0 16 16">
                                                        <path d="M15.545 6.558a9.42 9.42 0 0 1 .139 1.626c0 2.434-.87 4.492-2.384 5.885h.002C11.978 15.292 10.158 16 8 16A8 8 0 1 1 8 0a7.689 7.689 0 0 1 5.352 2.082l-2.284 2.284A4.347 4.347 0 0 0 8 3.166c-2.087 0-3.86 1.408-4.492 3.304a4.792 4.792 0 0 0 0 3.063h.003c.635 1.893 2.405 3.301 4.492 3.301 1.078 0 2.004-.276 2.722-.764h-.003a3.702 3.702 0 0 0 1.599-2.431H8v-3.08h7.545z" />
                                                    </svg>
                                                    <span className="ms-2 fs-6">Google</span>
                                                </a>
                                            </div>
                                        </div>
                                    </div> */}
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