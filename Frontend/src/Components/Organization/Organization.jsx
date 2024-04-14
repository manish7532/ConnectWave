import { useState } from 'react';
import axios from 'axios'; // Import axios for making HTTP requests
import logo from '../images/logo nav.png';
import { Link, useNavigate } from 'react-router-dom';

function Organization() {
    const [data, setData] = useState({
        email: "",
        org_Name: "",
        domain: "",
        logo: null
    });

    const navigate = useNavigate(); // Hook for navigation

    // Handle file change for organization logo
    const handleFileChange = (e) => {
        const file = e.target.files[0];
        setData((prevData) => ({ ...prevData, logo: file }));
    };

    // Handle form submission
    const handleFormSubmit = async (e) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('email', data.email);
        formData.append('org_Name', data.org_Name);
        formData.append('domain', data.domain);
        formData.append('logo', data.logo);

        try {
            // Send a POST request to the backend endpoint
            const response = await axios.post('http://localhost:3000/api/organization', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            // Handle response
            console.log(response.data)
            if (response.status === 201) {
                console.log('Organization registered successfully');
                // Redirect to another page (if needed)
                navigate('/dashboard');
            } else {
                console.log('Failed to register organization');
            }
        } catch (error) {
            console.error('Error submitting form:', error);
        }
    };

    return (
        <div style={{ minHeight: '100vh', margin: '0px', color: "black", fontFamily: 'Poppins', backgroundColor: '#001247' }}>
            <div className="row m-0 text-light">
                <div className="col-8">
                    <h5 className="text-light">
                        <img src={logo} height="50vh" alt="logo" />
                        ConnectWave
                    </h5>
                </div>
                <div className="col-4 mt-2 d-flex justify-content-end">
                    <Link to={"/login"} className="navanchor">Sign In</Link>
                </div>
            </div>
            <div className="container-fluid mt-4 mb-4">
                <div className="row justify-content-center align-items-center">
                    <div className="col-lg-5 col-md-8 col-sm-10">
                        <form className="orgForm" style={{ backgroundColor: 'white', padding: '50px', borderRadius: '1cap' }} encType="multipart/form-data" onSubmit={handleFormSubmit}>
                            <h3 className="text-center mb-4">Organization Details</h3>
                            <div className="row">
                                <div className="col-md-12 mb-2">
                                    <label htmlFor="email" className="form-label">User Email</label>
                                    <input type="email" name="email" className="form-control" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required />
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label htmlFor="org_Name" className="form-label">Organization Name</label>
                                    <input type="text" name="org_Name" className="form-control" value={data.org_Name} onChange={(e) => setData({ ...data, org_Name: e.target.value })} required />
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label htmlFor="domain" className="form-label">Domain</label>
                                    <input type="text" name="domain" className="form-control" value={data.domain} onChange={(e) => setData({ ...data, domain: e.target.value })} required />
                                </div>
                                <div className="col-md-12 mb-2">
                                    <label htmlFor="logo" className="form-label">Organization Logo</label>
                                    <input type="file" name="logo" className="form-control" accept='image/*' onChange={handleFileChange} />
                                </div>
                                <div className="col-12">
                                    <button type="submit" className="btn btn-primary mt-2 form-control">Submit</button>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Organization;
