import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function StaffDashboard() {
    const navigate = useNavigate()
    const handleLogout = () => {
    axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
        .then(() => navigate('/login'));
}


    useEffect(() => {
    axios.get('http://localhost:5000/user', { withCredentials: true })
        .then((res) => {
            if (!res.data.logged_in) {
                navigate('/login');
            }
        })
        .catch(() => {
            // If the request fails, assume not logged in
            navigate('/login');
        });
    }, [navigate]);

    return (
        <div>
            You Logged In as Staff!
            <button onClick={handleLogout}>LOGOUT</button>
        </div>
    )
}