import AdminSidePanel from "../../../../components/AdminSidePanel";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUser, faArrowRight, faSearch, faCrown, faUserShield, faUserTag, faUserTie } from "@fortawesome/free-solid-svg-icons";

export default function UsersManagement({ activeTab, setActiveTab }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [role, setRole] = useState("")
    const navigate = useNavigate();

    // Check session/role
    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/user', { withCredentials: true })
            .then((res) => {
                const { logged_in, role } = res.data;

                if (!logged_in || role === "") {
                    navigate('/');
                } else {
                    setRole(res.data.role)
                }
            })
            .catch(() => navigate('/'));
    }, [navigate]);

    // Fetch all users
    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/users_account', { withCredentials: true })
            .then((res) => {
                setUsers(res.data);
                setFilteredUsers(res.data);
            })
            .catch((err) => console.error(err));
    }, []);

    // Filter users based on search and role filter
    useEffect(() => {
        let result = users;
        
        // Apply search filter
        if (searchTerm) {
            result = result.filter(user => 
                user.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.email.toLowerCase().includes(searchTerm.toLowerCase())
            );
        }
        
        // Apply role filter
        if (roleFilter !== "all") {
            result = result.filter(user => user.role === roleFilter);
        }
        
        setFilteredUsers(result);
    }, [searchTerm, roleFilter, users]);

    const getRoleIcon = (role) => {
        switch(role) {
            case "admin": return faCrown;
            case "manager": return faUserShield;
            default: return faUserTag;
        }
    };

    const getRoleColor = (role) => {
        switch(role) {
            case "dmin": return "bg-purple-100 text-purple-800";
            case "manager": return "bg-blue-100 text-blue-800";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <>
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="min-h-screen ml-64 p-6 bg-gray-50">
                {/* Page Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                    <div className="flex items-center mb-4 md:mb-0">
                        <div className="bg-amber-100 p-3 rounded-lg mr-4">
                            <FontAwesomeIcon icon={faUsers} className="text-amber-600 text-xl" />
                        </div>
                        <div>
                            <h1 className="text-2xl md:text-3xl font-bold text-gray-800">Users Management</h1>
                            <p className="text-gray-500">Manage all user accounts and permissions</p>
                        </div>
                    </div>
                    
                    <Link 
                        to={["Super Admin"].includes(role) ? "/CreateAccount" : "#"}
                        className={`text-white px-4 py-2 rounded-lg font-medium transition-colors
                        ${["Super Admin"].includes(role)
                                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                                            : "bg-gray-400 cursor-not-allowed pointer-events-none"}`}
                    >
                        Add New User
                    </Link>
                </div>

                {/* Filters and Search */}
                <div className="bg-white p-4 rounded-xl shadow mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="md:col-span-2">
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <FontAwesomeIcon icon={faSearch} className="text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search users by name or email..."
                                    className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>
                        
                        <div>
                            <select 
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
                                value={roleFilter}
                                onChange={(e) => setRoleFilter(e.target.value)}
                            >
                                <option value="all">All Roles</option>
                                <option value="Staff">Staff</option>
                                <option value="Admin">Admin</option>
                                <option value="Super Admin">Super Admin</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-white p-4 rounded-xl shadow border-l-4 border-amber-500">
                        <div className="flex justify-between items-center">
                            <h3 className="text-gray-500">Total Users</h3>
                            <div className="bg-amber-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faUsers} className="text-amber-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold mt-2">{users.length} Users</p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow border-l-4 border-purple-500">
                        <div className="flex justify-between items-center">
                            <h3 className="text-gray-500">Staff</h3>
                            <div className="bg-purple-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faCrown} className="text-purple-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {users.filter(user => user.role === 'Staff').length} Staff
                        </p>
                    </div>

                    <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-500">
                        <div className="flex justify-between items-center">
                            <h3 className="text-gray-500">Admin</h3>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faUserTie} className="text-blue-600" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {users.filter(user => user.role === 'Admin').length} Admin
                        </p>
                    </div>
                    
                    <div className="bg-white p-4 rounded-xl shadow border-l-4 border-blue-900">
                        <div className="flex justify-between items-center">
                            <h3 className="text-gray-500">Super Admin</h3>
                            <div className="bg-blue-100 p-2 rounded-lg">
                                <FontAwesomeIcon icon={faUserShield} className="text-blue-900" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold mt-2">
                            {users.filter(user => user.role === 'Super Admin').length} Super Admin
                        </p>
                    </div>
                </div>

                {/* User List Card */}
                <div className="bg-white shadow-lg rounded-xl overflow-hidden">
                    <div className="border-b border-gray-200 px-6 py-4 bg-gray-50">
                        <h2 className="text-lg font-semibold text-gray-800">User Accounts</h2>
                    </div>
                    
                    {filteredUsers.length === 0 ? (
                        <div className="p-8 text-center">
                            <div className="mx-auto w-16 h-16 flex items-center justify-center bg-gray-100 rounded-full mb-4">
                                <FontAwesomeIcon icon={faUser} className="text-gray-400 text-xl" />
                            </div>
                            <h3 className="text-lg font-medium text-gray-900 mb-1">No users found</h3>
                            <p className="text-gray-500">Try adjusting your search or filter criteria</p>
                        </div>
                    ) : (
                        <ul className="divide-y divide-gray-200">
                            {filteredUsers.map((user) => (
                                <li 
                                    key={user.id} 
                                    className="p-6 hover:bg-amber-50 transition-all duration-200"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center space-x-4">
                                            <div className="flex-shrink-0">
                                                <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                                    <FontAwesomeIcon 
                                                        icon={faUser} 
                                                        className="text-amber-600" 
                                                    />
                                                </div>
                                            </div>
                                            <div>
                                                <div className="flex items-center space-x-2">
                                                    <span className="text-gray-800 font-semibold text-lg">
                                                        {user.first_name} {user.last_name}
                                                    </span>
                                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRoleColor(user.role)}`}>
                                                        <FontAwesomeIcon icon={getRoleIcon(user.role)} className="mr-1" />
                                                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                                    </span>
                                                </div>
                                                <p className="text-gray-500">{user.email}</p>
                                            </div>
                                        </div>

                                        {/* Right: View Button */}
                                        <Link
                                        to={["Admin", "Super Admin" ].includes(role) ? `/UserManagement/${user.id}` : "#"}
                                        onClick={(e) => {
                                            if (!["Admin", "Super Admin"].includes(role)) e.preventDefault(); // block staff
                                        }}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors
                                            ${["Admin", "Super Admin"].includes(role)
                                            ? "bg-amber-600 hover:bg-amber-700 text-white"
                                            : "bg-gray-400 cursor-not-allowed pointer-events-none"}
                                        `}
                                        >
                                        <span>View Details</span>
                                        <FontAwesomeIcon icon={faArrowRight} />
                                        </Link>

                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </>
    );
}