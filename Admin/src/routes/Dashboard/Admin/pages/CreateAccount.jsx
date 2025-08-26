import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import axios from "axios";
import { faEnvelope, faUser, faLock, faIdBadge, faEye, faEyeSlash, faShield, faUserPlus } from "@fortawesome/free-solid-svg-icons";
import AccountCreation from "../../../../components/success/Message";
import AdminSidePanel from "../../../../components/AdminSidePanel";

const email = <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl" />;
const user = <FontAwesomeIcon icon={faUser} className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl" />;
const passwordIcon = <FontAwesomeIcon icon={faLock} className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl" />;
const badgeIcon = <FontAwesomeIcon icon={faIdBadge} className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl" />;
const roleIcon = <FontAwesomeIcon icon={faShield} className="text-gray-400 text-sm sm:text-base md:text-lg lg:text-xl" />;

export default function Register({ activeTab, setActiveTab }) {
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
    const [showPassword, setShowPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);

    const showPass = () => {
        setShowPassword(!showPassword);
    }

    useEffect(() => {
        if (!registerData.password) {
            setPasswordStrength(0);
            return;
        }
        let strength = 0;
        if (registerData.password.length >= 8) strength++;
        if (/[A-Z]/.test(registerData.password)) strength++;
        if (/[0-9]/.test(registerData.password)) strength++;
        if (/[^A-Za-z0-9]/.test(registerData.password)) strength++;
        setPasswordStrength(strength);
    }, [registerData.password]);

    const handleRegister = async (e) => {
        e.preventDefault();
        setError(null);

        if (!registerData.first_name || !registerData.last_name || !registerData.email ||
            !registerData.username || !registerData.password || !registerData.role) {
            setError("Please fill in all fields");
            return;
        }

        if (registerData.password.length < 8) {
            setError("Password must be at least 8 characters long");
            return;
        }

        try {
            if (isLoading) return;
            setIsLoading(true);

            const res = await axios.post('https://caferealitea.onrender.com/register', registerData, {
                withCredentials: true,
                headers: { "Content-Type": "application/json" }
            });

            console.log(res.data.message);
            setSuccessMessage(true);
            setRegisterData({
                first_name: "",
                last_name: "",
                email: "",
                username: "",
                password: "",
                role: "",
            });

        } catch (err) {
            console.error("Registration failed:", err);
            setError(err.response?.status === 401
                ? "Invalid Credentials"
                : err.response?.data?.message || "Registration failed. Please try again."
            )
            setTimeout(() => setError(""), 3000)
        } finally {
            setIsLoading(false);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setRegisterData((data) => ({ ...data, [name]: value }));
    };

    useEffect(() => {
        document.title = "Café Realitea - Create Account";
        setLoading(true);

        axios.get("https://caferealitea.onrender.com/user", { withCredentials: true })
            .then((res) => {
                if (!res.data.logged_in || res.data.role === null) {
                    navigate("/");
                }
                if (["Staff", "Admin"].includes(res.data.role)) {
                    navigate('/dashboard')
                }
            })
            .catch((err) => {
                console.error("Session check failed:", err);
                navigate("/");
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-amber-50">
                <div className="relative">
                    <div className="w-16 h-12 border-4 border-amber-900 rounded-b-xl rounded-t-sm overflow-hidden">
                        <div
                            className="absolute bottom-0 left-0 w-full bg-amber-700 transition-all duration-2000"
                            style={{
                                height: '0%',
                                animation: 'coffeeFill 1.5s ease-in-out forwards',
                                animationDelay: '0.3s'
                            }}
                        ></div>
                    </div>
                    <div className="absolute -top-0.5 -inset-x-0.5 h-1 bg-amber-900 rounded-t-sm"></div>
                    <div className="absolute -bottom-2 -inset-x-4 h-2 bg-amber-200 rounded-full"></div>
                </div>
                <p className="mt-6 text-amber-900 font-medium text-sm sm:text-base md:text-lg lg:text-xl">Brewing your experience...</p>
                <style>
                    {`
                    @keyframes coffeeFill {
                        0% { height: 0%; }
                        20% { height: 20%; }
                        50% { height: 50%; }
                        80% { height: 80%; }
                        100% { height: 85%; }
                    }
                    `}
                </style>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />

            {successMessage && (
                <AccountCreation
                    Message={"Account created successfully"}
                    onClose={() => setSuccessMessage(false)}
                />
            )}

            <div className="flex-1 ml-0 lg:ml-65 transition-all duration-300">
                <div className="w-full mx-auto py-6 px-4 lg:px-6">
                    {/* Header */}
                    <div className="flex items-center mb-8 pt-15 lg:pt-0">
                        <div className="hidden lg:flex bg-amber-100 p-3 rounded-lg mr-4">
                            <FontAwesomeIcon icon={faUserPlus} className="text-amber-600 text-sm sm:text-base md:text-lg lg:text-xl" />
                        </div>
                        <div>
                            <h1 className="text-base sm:text-lg md:text-xl lg:text-3xl font-bold text-gray-800">
                                Create an Account
                            </h1>
                            <p className="text-xs sm:text-sm md:text-base lg:text-lg text-gray-500">
                                Account Creation for Staff's
                            </p>
                        </div>
                    </div>

                    {/* Form Card */}
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200">
                        <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-amber-50 to-white">
                            <h2 className="text-sm sm:text-base md:text-lg lg:text-xl font-semibold text-gray-800 flex items-center">
                                <FontAwesomeIcon icon={faIdBadge} className="mr-2 text-amber-600 text-sm sm:text-base md:text-lg lg:text-xl" />
                                Account Information
                            </h2>
                            <p className="text-xs sm:text-sm md:text-base text-gray-600 mt-1">Fill in the details to create a new account</p>
                        </div>

                        <div className="p-6">
                            {error && (
                                <div className="mb-6 p-4 bg-red-50 text-red-700 rounded-lg flex items-start text-xs sm:text-sm md:text-base">
                                    <svg className="w-4 h-4 sm:w-5 sm:h-5 mr-3 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                    </svg>
                                    <div>{error}</div>
                                </div>
                            )}

                            {/* FORM */}
                            <form className="space-y-8 text-xs sm:text-sm md:text-base lg:text-lg" onSubmit={handleRegister}>
                                {/* Personal Information Section */}
                                <div>
                                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                                        <FontAwesomeIcon icon={faUser} className="mr-2 text-amber-500 text-sm sm:text-base md:text-lg lg:text-xl" />
                                        Personal Information
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* First Name */}
                                        <div>
                                            <label htmlFor="first_name" className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2">
                                                First Name *
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
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
                                                    className="block w-full pl-10 pr-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm md:text-base lg:text-lg transition-colors"
                                                    placeholder="John"
                                                />
                                            </div>
                                        </div>

                                        {/* Last Name */}
                                        <div>
                                            <label htmlFor="last_name" className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2">
                                                Last Name *
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
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
                                                    className="block w-full pl-10 pr-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm md:text-base lg:text-lg transition-colors"
                                                    placeholder="Doe"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Email */}
                                    <div className="mt-6">
                                        <label htmlFor="email" className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2">
                                            Email Address *
                                        </label>
                                        <div className="relative rounded-lg shadow-sm">
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
                                                className="block w-full pl-10 pr-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm md:text-base lg:text-lg transition-colors"
                                                placeholder="john.doe@example.com"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Account Settings Section */}
                                <div>
                                    <h3 className="text-sm sm:text-base md:text-lg lg:text-xl font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200 flex items-center">
                                        <FontAwesomeIcon icon={faShield} className="mr-2 text-amber-500 text-sm sm:text-base md:text-lg lg:text-xl" />
                                        Account Settings
                                    </h3>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        {/* Username */}
                                        <div>
                                            <label htmlFor="username" className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2">
                                                Username *
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
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
                                                    className="block w-full pl-10 pr-4 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm md:text-base lg:text-lg transition-colors"
                                                    placeholder="johndoe"
                                                />
                                            </div>
                                        </div>

                                        {/* Role */}
                                        <div>
                                            <label htmlFor="role" className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2">
                                                Role *
                                            </label>
                                            <div className="relative rounded-lg shadow-sm">
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    {roleIcon}
                                                </div>
                                                <select
                                                    name="role"
                                                    value={registerData.role}
                                                    onChange={handleChange}
                                                    className="block w-full pl-10 pr-10 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg text-gray-700 focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm md:text-base lg:text-lg transition-colors appearance-none bg-white"
                                                    required
                                                >
                                                    <option value="" disabled>Select a role</option>
                                                    <option value="Staff">Staff</option>
                                                    <option value="Admin">Admin</option>
                                                    <option value="System Administrator">System Administrator</option>
                                                </select>
                                                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                                    <svg className="h-4 w-4 sm:h-5 sm:w-5 text-gray-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                                                        <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Password */}
                                    <div className="mt-6">
                                        <label htmlFor="password" className="block text-xs sm:text-sm md:text-base font-medium text-gray-700 mb-2">
                                            Password *
                                        </label>
                                        <div className="relative rounded-lg shadow-sm">
                                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                {passwordIcon}
                                            </div>
                                            <input
                                                id="password"
                                                name="password"
                                                type={showPassword ? "text" : "password"}
                                                required
                                                value={registerData.password}
                                                onChange={handleChange}
                                                className="block w-full pl-10 pr-12 py-2 sm:py-2.5 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm md:text-base lg:text-lg transition-colors"
                                                placeholder="••••••••"
                                            />
                                            <button
                                                type="button"
                                                onClick={showPass}
                                                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-amber-600 transition-colors"
                                            >
                                                {showPassword ? (
                                                    <FontAwesomeIcon icon={faEyeSlash} className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                                                ) : (
                                                    <FontAwesomeIcon icon={faEye} className="h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6 lg:h-7 lg:w-7" />
                                                )}

                                            </button>
                                        </div>
                                        
                                        {/* Password Strength Meter */}
                                        {registerData.password && (
                                            <div className="mt-3">
                                                <div className="flex items-center justify-between mb-1">
                                                    <span className="text-xs text-gray-500">Password strength</span>
                                                    <span className="text-xs font-medium text-gray-700">
                                                        {passwordStrength === 0 && 'Very Weak'}
                                                        {passwordStrength === 1 && 'Weak'}
                                                        {passwordStrength === 2 && 'Fair'}
                                                        {passwordStrength === 3 && 'Good'}
                                                        {passwordStrength === 4 && 'Strong'}
                                                    </span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className={`h-2 rounded-full transition-all duration-300 ${
                                                            passwordStrength === 0 ? 'bg-red-500 w-1/4' : 
                                                            passwordStrength === 1 ? 'bg-red-400 w-2/4' : 
                                                            passwordStrength === 2 ? 'bg-yellow-500 w-3/4' : 
                                                            passwordStrength === 3 ? 'bg-green-400 w-4/4' : 
                                                            'bg-green-500 w-full'
                                                        }`}
                                                    ></div>
                                                </div>
                                            </div>
                                        )}
                                        
                                        <p className="mt-2 text-xs text-gray-500">
                                            Password must be at least 8 characters long with uppercase, number and special character
                                        </p>
                                    </div>
                                </div>

                                {/* Submit Button */}
                                <div className="pt-4">
                                    <button
                                        type="submit"
                                        disabled={isLoading}
                                        className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white ${isLoading ? 'bg-amber-400 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-700'} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500 transition-colors duration-300`}
                                    >
                                        {isLoading ? (
                                            <>
                                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                </svg>
                                                Creating Account...
                                            </>
                                        ) : (
                                            'Create Account'
                                        )}
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