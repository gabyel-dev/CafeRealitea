import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [logged_in, setIsLoggedIn] = useState(false);
    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
    });

    const handleLogin = async (e) => {
        e.preventDefault();

        try {
            if (logged_in) return;
            setIsLoggedIn(true);
            const res = await axios.post('http://localhost:5000/login', loginData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            const role = res.data.user.role;
            navigate(role === "Admin" ? `/dashboard/${role}` : `/dashboard/${role}`);

        } catch (err) {
            console.error("Login failed:", err);
            setIsLoggedIn(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData((data) => ({ ...data, [name]: value }));
    };

    return (
        <div className="min-h-screen bg-white flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                {/* Logo placeholder */}
                <div className="mx-auto h-20 w-20 bg-amber-50 rounded-full flex items-center justify-center mb-6 ring-2 ring-amber-100">
                    <span className="text-amber-700 text-2xl font-serif font-bold">CR</span>
                </div>
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Cafe Realitea
                </h2>
                <p className="mt-2 text-center text-sm text-gray-500">
                    Sign in to your staff portal
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="py-8 px-4 sm:px-10">
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700">
                                Username
                            </label>
                            <div className="mt-1">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={loginData.username}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 bg-white rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Password
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={loginData.password}
                                    onChange={handleChange}
                                    className="block w-full px-3 py-2 bg-white rounded-md shadow-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent sm:text-sm"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={logged_in}
                                className={`w-full flex justify-center py-2 px-4 rounded-md shadow-sm text-sm font-medium text-white ${logged_in ? 'bg-amber-300' : 'bg-amber-600 hover:bg-amber-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500`}
                            >
                                {logged_in ? 'Signing in...' : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}