import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom"

export default function Login() {
    const Navigate = useNavigate()
    const [loginData, setLoginData] = useState({
        user: "",
        password: ""
    });

    const [message, setMessage] = useState("");
    const [loggedIn, setLoggedIn] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData({ ...loginData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post(
                "http://localhost:5000/login",
                {
                    username: loginData.user,
                    password: loginData.password
                },
                { withCredentials: true } // very important for session cookies
            );
            Navigate("/dashboard")

            setMessage("Login successful!");
            setLoggedIn(true);
            console.log(res.data); // debug
        } catch (err) {
            console.error(err);
            setMessage("Login failed. Invalid credentials.");
        }
    };

    return (
        <div style={{ maxWidth: "400px", margin: "50px auto", textAlign: "center" }}>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    name="user"
                    placeholder="Username"
                    value={loginData.user}
                    onChange={handleChange}
                    required
                    style={{ display: "block", width: "100%", padding: "10px", marginBottom: "10px" }}
                />
                <input
                    type="password"
                    name="password"
                    placeholder="Password"
                    value={loginData.password}
                    onChange={handleChange}
                    required
                    style={{ display: "block", width: "100%", padding: "10px", marginBottom: "10px" }}
                />
                <button type="submit" style={{ padding: "10px 20px" }}>Login</button>
            </form>
            {message && <p>{message}</p>}
        </div>
    );
}
