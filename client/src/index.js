import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/main.css'
import React from "react";
import ReactDOM from "react-dom";
import NavBar from './components/Navbar';

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"
import HomePage from './components/Home';
import SignupPage from './components/Signup';
import LoginPage from './components/Login';
import ShortenURLPage from './components/ShortenURL';
import RedirectLink from './components/Redirect';
import FeaturePage from './components/Features';
import AnalyticsPage from './components/Analytics';
import Footer from './components/Footer';

// export const baseUrl = "http://localhost:5000";
// export const domain = "http://localhost:3000";
// export const qr_code_folder = "/qr_code_img";

export const baseUrl = process.env.REACT_APP_BASE_URL
export const domain = process.env.REACT_APP_DOMAIN_URL
export const qr_code_folder = process.env.REACT_APP_QR_CODE_FOLDER_PATH

export const usernameRegex = /^[a-zA-Z0-9_]{3,25}$/;
export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const customUrlRegex = /^[a-zA-Z0-9_]{5,20}$/;
export const urlRegex = /^(https?:\/\/)/;


const App = () => {
    console.log(baseUrl);
    console.log(domain);
    console.log(qr_code_folder);
    return (
        <Router>
            <div>
                <NavBar />
                <Routes>
                    <Route path="/:short_url" element={<RedirectLink />} />
                    <Route path="/analytics/:link_id" element={<AnalyticsPage />} />
                    <Route path="/features" element={<FeaturePage />} />
                    <Route path="/shorten" element={<ShortenURLPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/" element={<HomePage />} />
                </Routes>
                <Footer />
            </div>
        </Router>
    )
}

ReactDOM.render(<App />, document.getElementById("root"));
