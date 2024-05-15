import './login.css';
import logo from "../images/logo nav.png";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios'

function Login() {
    const navigate = useNavigate();
    const [data, setData] = useState({
        email: '',
        password: ''
    })

    async function submitHandler(e) {
        e.preventDefault();
        try {
            const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/login`, data);
            if (res.status === 200) {
                toast.success("Login successful", {
                    position: "top-center"
                });
                // Store token in local storage
                localStorage.setItem("token", res.data.token);
                localStorage.setItem("user", JSON.stringify({ userdata: res.data.user }));
                navigate('/dashboard');
            } else {
                toast.error(res.data, {
                    position: "top-center"
                });
            }
        } catch (error) {
            if (error.response) {
                toast.error(error.response.data.error, {
                    position: "top-center"
                });
            } else {
                toast.error("An error occurred while logging in", {
                    position: "top-center"
                });
            }
        }
    }


    return (
        <>
            <div className="container">
                <nav className="mt-3">
                    <div className="logo d-flex">
                        <img src={logo} height="50vh" alt="logo" />
                        <h4 className="mt-3">ConnectWave</h4>
                    </div>
                </nav>

                <div className="row m-0 gy-4 align-items-center">
                    <div className="col-12 col-md-6 col-xl-7">
                        <div className="d-flex">
                            <div className="col-12 col-xl-9">
                                <h2 className="h1 mb-4">Connect with anyone, anywhere.</h2>
                                <p className="lead mb-5">
                                    Unlock the Power of Engaging Webinars: Seamlessly Manage, Stream, and Analyze Your Events with Ease!
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="col-12 col-md-6 col-xl-5">
                        <div className="card border-0 rounded-4">
                            <div className="card-body p-3 p-md-4 p-xl-5">
                                <div className="row">
                                    <div className="col-12">
                                        <div className="mb-4">
                                            <h3>Sign in</h3>
                                            <p>
                                                {`Don't have an account?`} <Link to={"/register"}>Sign up</Link>
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <form onSubmit={submitHandler}>
                                    <div className="row gy-3 overflow-hidden">
                                        <div className="col-12">
                                            <div className="form-floating mb-3">
                                                <input type="email" className="form-control" name="email" id="email" onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="name@example.com" required />
                                                <label htmlFor="email" className="form-label">Email</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="form-floating mb-3">
                                                <input type="password" className="form-control" name="password" id="password" onChange={(e) => setData({ ...data, password: e.target.value })} placeholder="Password" required />
                                                <label htmlFor="password" className="form-label">Password</label>
                                            </div>
                                        </div>
                                        <div className="col-12">
                                            <div className="d-grid">
                                                <button className="btn btn-primary btn-lg" type="submit">
                                                    Log in now
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </form>

                                <div className="row">
                                    <div className="col-12">
                                        <div className="d-flex gap-2 gap-md-4 flex-column flex-md-row justify-content-md-center mt-4">
                                            <Link to={"/reset"}>Forgot password</Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <ToastContainer />
        </>
    );
}

export default Login;

