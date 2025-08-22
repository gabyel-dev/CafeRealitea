import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { faEnvelope, faUser, faLock, faIdBadge } from "@fortawesome/free-solid-svg-icons";
import AccountCreation from "../../../../components/success/Message";
import AdminSidePanel from "../../../../components/AdminSidePanel";

const email = <FontAwesomeIcon icon={faEnvelope} className="text-gray-400" />;
const user = <FontAwesomeIcon icon={faUser} className="text-gray-400" />;
const passwordIcon = <FontAwesomeIcon icon={faLock} className="text-gray-400" />;
const badgeIcon = <FontAwesomeIcon icon={faIdBadge} className="text-gray-400" />;

export default function Register({ activeTab, setActiveTab}) {
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(false);
    const [registerData, setRegisterData] = useState({
        first_name: "",
        last_name: "",
        email: "",
        username: "",
        password: "",
        role: "",
    });

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (!registerData.username || !registerData.password) {
            setError("Please enter all fields");
            return;
        }

        try {
            if (isLoading) return;
            setIsLoading(true);
            
            const res = await axios.post('https://caferealitea.onrender.com/register', registerData, {
                withCredentials: true,
                headers: {
                    "Content-Type": "application/json"
                }
            });

            console.log(res.data.message);
            setSuccessMessage(true);

        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.response?.status === 401
                ? "Invalid Credentials"
                : err.response?.data?.message || "Registration failed. Please try again."
            )
            setTimeout(() => setError(""), 3000)
            setIsLoading(false);
        } 
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegisterData((data) => ({ ...data, [name]: value }));
    };

    // check user session
    useEffect(() => {
        document.title = "Café Realitea - Create Account";
        setLoading(true);

        axios.get("https://caferealitea.onrender.com/user", { withCredentials: true })
            .then((res) => {
                if (!res.data.logged_in || res.data.role === null) {
                    navigate("/");
                } 
                else if (res.data.role === "Staff") {
                    navigate("/Staff/dashboard");
                }
            })
            .catch((err) => {
                console.error("Session check failed:", err);
                navigate("/"); // fallback
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            {successMessage && (
                    <AccountCreation Message={"Account created successfully"} />
                )}
            <div className="flex-1 ml-80">
                

                <div className="max-w-4xl py-6 px-10">
                    <div className="w-full mb-5">
                        <h1 className="text-3xl font-bold">Create an Account</h1>
                        Create and manage customer orders
                    </div>

                    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h2 className="text-lg font-semibold text-gray-800">Account Information</h2>
                            <p className="text-sm text-gray-500">Fill in the details to create a new account</p>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg text-sm flex items-start">
                                    <svg className="w-5 h-5 mr-3 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div>{error}</div>
                                </div>
                            )}

                            <form className="space-y-6" onSubmit={handleRegister}>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                {badgeIcon}
                                            </div>
                                            <input
                                                id="first_name"
                                                name="first_name"
                                                type="text"
                                                required
                                                value={registerData.first_name}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                                placeholder="John"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                {badgeIcon}
                                            </div>
                                            <input
                                                id="last_name"
                                                name="last_name"
                                                type="text"
                                                required
                                                value={registerData.last_name}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                                placeholder="Doe"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                {email}
                                            </div>
                                            <input
                                                id="email"
                                                name="email"
                                                type="email"
                                                required
                                                value={registerData.email}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                                placeholder="john.doe@example.com"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                                            Role
                                        </label>
                                        <div className="relative rounded-md shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                <svg className="w-5 h-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                            <select
                                                name="role"
                                                value={registerData.role}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-md text-gray-700 focus:ring-amber-500 focus:border-amber-500 sm:text-sm appearance-none bg-white"
                                                required
                                            >
                                                <option value="" disabled>Select a role</option>
                                                <option value="Staff">Staff</option>
                                                <option value="Admin">Admin</option>
                                            </select>
                                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                <svg className="h-5 w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                </svg>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                                        Username
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {user}
                                        </div>
                                        <input
                                            id="username"
                                            name="username"
                                            type="text"
                                            required
                                            value={registerData.username}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                            placeholder="johndoe"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                        Password
                                    </label>
                                    <div className="relative rounded-md shadow-sm">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            {passwordIcon}
                                        </div>
                                        <input
                                            id="password"
                                            name="password"
                                            type="password"
                                            required
                                            value={registerData.password}
                                            onChange={handleChange}
                                            className="block w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500 sm:text-sm"
                                            placeholder="••••••••"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">
                                        Password must be at least 8 characters long
                                    </p>
                                </div>

                                <div className="pt-2">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full flex justify-center items-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${isLoading ? 'bg-amber-400' : 'bg-amber-600 hover:bg-amber-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-200`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating account...
                                            </>
                                        ) : 'Create Account' }
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>

                    <div className="mt-8 text-center text-sm text-gray-500">
                        <p>© {new Date().getFullYear()} Café Realitea. All rights reserved.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}