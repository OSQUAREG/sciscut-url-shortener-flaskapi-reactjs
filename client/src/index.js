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
import LogoutPage from './components/Logout';

export const baseUrl = "http://localhost:5000";
export const usernameRegex = /^[a-zA-Z0-9_]{3,25}$/;
export const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;
export const customUrlRegex = /^[a-zA-Z0-9_]{5,20}$/;


const App = () => {
    return (
        <Router>
            <div className="">
                <NavBar />
                <Routes>
                    <Route path="/logout/" element={<LogoutPage />} />
                    <Route path="/shorten" element={<ShortenURLPage />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/signup" element={<SignupPage />} />
                    <Route path="/" element={<HomePage />} />
                </Routes>
            </div>
        </Router>
    )
}

ReactDOM.render(<App />, document.getElementById("root"));
