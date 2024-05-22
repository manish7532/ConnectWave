import './register.css';
import logo from '../images/logo nav.png';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Country } from 'country-state-city';


function Register() {

  const [data, setData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    country: '',
    type: '',
    password: '',
    confirmPassword: ''
  })

  const [profilePhoto, setProfilePhoto] = useState(null);
  const [countries, setCountries] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchedCountries = Country.getAllCountries();
    setCountries(fetchedCountries);
    setData((prevData) => ({
      ...prevData,
      country: 'IN',
      type: 'Individual',
    }));
  }, []);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setProfilePhoto(file);
  };

  const handleTypeChange = (e) => {
    const selectedType = e.target.value;
    setData((prevData) => ({ ...prevData, type: selectedType }));
  };

  const handleFormSubmit = async (event) => {
    event.preventDefault();

    const formData = new FormData();
    formData.append('email', data.email);
    formData.append('firstname', data.firstname);
    formData.append('lastname', data.lastname);
    formData.append('country', data.country);
    formData.append('type', data.type);
    formData.append('password', data.password);

    if (profilePhoto) {
      formData.append('profilePhoto', profilePhoto);
    } else {
      console.log('profilePhoto is not attached');
    }

    try {
      if (data.password === data.confirmPassword) {
        const response = await axios.post(`${import.meta.env.VITE_API_URL}/api/register`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });



        window.scrollTo(0, 0);
        const responseData = response.data;
        // console.log(responseData);
        switch (response.data) {
          case 1:
            toast.error("User Already Exists", {
              position: "top-center"
            });
            break;
          case 2:
            toast.error("Missing required Fields", {
              position: "top-center"
            });
            break;
          case 3:
            if (data.type == 'Organization') {
              navigate(`./organization`);
            } else {
              toast.success('User registered successfully', {
                position: "top-center"
              })
              navigate('/login')
            }
            break;
          default:
            console.log("nothing happend")
        }

        setData({
          firstname: '',
          lastname: '',
          email: '',
          country: 'IN',
          type: 'Individual',
          password: '',
          confirmPassword: '',
        });

      } else {
        alert("Password didn't match");
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (<>
    <div>
      <div className="row m-0 text-light">
        <div className="col-8">
          <h5 className="text-light">
            <img src={logo} height="50vh" alt="ConnectWave Logo" /> ConnectWave
          </h5>
        </div>
        <div className="col-4 mt-2 d-flex justify-content-end">
          <Link className="navanchor" to={"/login"}>
            Sign In
          </Link>
        </div>
      </div>
      <div className="container-fluid mt-4 mb-4">
        <div className="row justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
          <div className="col-lg-5 col-md-8 col-sm-10">
            <form className='form' onSubmit={handleFormSubmit} encType="multipart/form-data">
              <h3 className="text-center mb-4">Sign Up</h3>
              <div className="row">
                <div className="col-md-12 mb-2">
                  <label htmlFor="firstName" className="form-label">
                    First Name
                  </label>
                  <input type="text" name="firstname" className="form-control" value={data.firstname} onChange={(e) => setData({ ...data, firstname: e.target.value })} required />
                </div>
                <div className="col-md-12 mb-2">
                  <label htmlFor="lastName" className="form-label">
                    Last Name
                  </label>
                  <input type="text" name="lastname" className="form-control" value={data.lastname} onChange={(e) => setData({ ...data, lastname: e.target.value })} required />
                </div>
                <div className="col-md-12 mb-2">
                  <label htmlFor="email" className="form-label">
                    Email
                  </label>
                  <input type="email" name="email" className="form-control" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} required />
                </div>
                <div className="col-md-12 mb-2">
                  <label htmlFor="country" className="form-label">
                    Country
                  </label>
                  <select className="form-select" name='country' aria-label="Default select example" value={data.country} onChange={(e) => setData({ ...data, country: e.target.value })} required>
                    {countries.map((country) => (
                      <option key={country.isoCode} value={country.isoCode}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-md-12 mb-2">
                  <label className="form-label d-block">Type</label>
                  <div className="form-check form-check-inline">
                    <input type="radio" name="type" className="form-check-input" value="Organization"
                      onChange={handleTypeChange} />
                    <label className="form-check-label">Organization</label>
                  </div>
                  <div className="form-check form-check-inline">
                    <input type="radio" name="type" className="form-check-input" value="Individual" defaultChecked onChange={handleTypeChange} />
                    <label className="form-check-label">Individual</label>
                  </div>
                </div>
                <div className="col-md-12 mb-2">
                  <label htmlFor="photo" className="form-label">
                    Profile Photo
                  </label>
                  <input type="file" accept='image/*' name="profilePhoto" className="form-control" onChange={(e) => handleFileChange(e)} />
                </div>
                <div className="col-md-12 mb-2">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input type="password" name="password" className="form-control" value={data.password} onChange={(e) => setData({ ...data, password: e.target.value })} required />
                </div>
                <div className="col-md-12 mb-2">
                  <label htmlFor="confirmPassword" className="form-label">
                    Confirm Password
                  </label>
                  <input type="password" name="confirmPassword" className="form-control" value={data.confirmPassword} onChange={(e) => setData({ ...data, confirmPassword: e.target.value })} required />
                </div>
                <div className="col-12">
                  <button type="submit" className="btn btn-primary mt-2 form-control">
                    Register
                  </button>
                </div>
                <div className="col-12 mt-2 text-center">
                  Already Have An Account? <Link className='regSignin' to={"/login"}>Sign In</Link>
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

export default Register;
