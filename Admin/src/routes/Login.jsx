import { useState, useEffect, use } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login() {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [loginData, setLoginData] = useState({
        username: "",
        password: "",
    });

    const handleLogin = async (e) => {
        e.preventDefault();
        setError(null);

        if (!loginData.username || !loginData.password) {
            setError("Please enter both username and password");
            return;
        }

        try {
            if (isLoading) return;
            setIsLoading(true);
            
            const res = await axios.post('http://localhost:5000/login', loginData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });
            
            const role = res.data.user.role;
            navigate(`/dashboard/${role}`);

        } catch (err) {
            console.error("Login failed:", err);
            setError(err.response?.status === 401
                                                    ? "Invalid Credentials"
                                                    : err.response?.data?.message || "Login failed. Please try again."
        );
            setIsLoading(false);
        }
    };


    const handleChange = (e) => {
        const { name, value } = e.target;
        setLoginData((data) => ({ ...data, [name]: value }));
    };

    // check user session
    useEffect(() => {
        document.title = "Café Realitea - Login";
        axios.get('http://localhost:5000/user', { withCredentials: true })
             .then((res) => {
                if (res.data.logged_in) {
                    navigate(`/dashboard/${res.data.user.role}`)
                }
             })
    }, [navigate])

    return (
        <div className="min-h-screen bg-gradient-to-br from-amber-50 to-amber-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <div className="flex justify-center">
                    <div className="w-24 h-24 rounded-full bg-white shadow-md flex items-center justify-center mb-6 border-2 border-amber-200">
                        <span className="text-amber-700 text-3xl font-serif font-bold">CR</span>
                    </div>
                </div>
                <div className="text-center">
                    <h2 className="text-3xl font-extrabold text-gray-900 font-serif">
                        Café Realitea
                    </h2>
                    <p className="mt-2 text-sm text-gray-600">
                        Staff Portal
                    </p>
                </div>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow-lg rounded-lg sm:px-10 border border-amber-100">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                            {error}
                        </div>
                    )}
                    <form className="space-y-6" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                Username
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="username"
                                    name="username"
                                    type="text"
                                    required
                                    value={loginData.username}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    placeholder="Enter your username"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <input
                                    id="password"
                                    name="password"
                                    type="password"
                                    required
                                    value={loginData.password}
                                    onChange={handleChange}
                                    className="block w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                    placeholder="Enter your password"
                                />
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-amber-400' : 'bg-amber-600 hover:bg-amber-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200`}
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Signing in...
                                    </>
                                ) : 'Sign in'}
                            </button>
                        </div>
                    </form>
                </div>
                <div className="mt-6 text-center text-sm text-gray-600">
                    <p>© {new Date().getFullYear()} Café Realitea. All rights reserved.</p>
                </div>
            </div>
        </div>
    );
}