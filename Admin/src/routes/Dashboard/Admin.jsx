import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate()
    const handleLogout = () => {
    axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
        .then(() => navigate('/login'));
}

    useEffect(() => {
    document.title = "Café Realitea - Admin";
    axios.get('http://localhost:5000/user', { withCredentials: true })
        .then((res) => {
            if (!res.data.logged_in) {
                navigate('/login');
            }

            if (res.data.role !== 'Admin') {
                navigate('/dashboard/Staff')
            } else {
                navigate('/dashboard/Admin')
            }
        })
        .catch(() => {
            // If the request fails, assume not logged in
            navigate('/login');
        });
    }, [navigate]);

    return (
        <div>
            You Logged In as Admin!
            <button onClick={handleLogout}>LOGOUT</button>
        </div>
    )
}