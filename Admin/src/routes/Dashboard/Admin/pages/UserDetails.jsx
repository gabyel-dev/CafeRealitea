import { useNavigate, useParams } from "react-router-dom"
import { useState, useEffect } from "react"
import axios from "axios"
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";
import { useLocation } from "react-router-dom";
import EditUser from "../../../../components/EditUser/EditUser";
import DeleteUser from "../../../../components/DeleteUser/DeleteUser";

export default function UserDetails() {
    const navigate = useNavigate()
    const [userDetails, setUserDetails] = useState({});
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [showFormDelete, setShowFormDelete] = useState(false);
    const [checkRole, setCheckRole] = useState(null)

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const id = query.get('id')

    useEffect(() => {   
        axios.get('https://caferealitea.onrender.com/user', {withCredentials: true})
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "Staff") {
                    navigate('/');
                    return;
                } 

                setCheckRole(res.data)

            })
    }, []);

        useEffect(() => {
            document.title = "Café Realitea - User Details";
            setLoading(true)
            axios.get(`https://caferealitea.onrender.com/api/users/${id}`)
            .then((res) => {
                setUserDetails(res.data)
                setLoading(false)
            })
            .catch(() => {
                setLoading(false)
            })
        }, [id])

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidePanel />

            {showForm && (
                <EditUser showForm={setShowForm} id={id} onRoleUpdate={(newRole) => 
                    setUserDetails((prev) => ({ ...prev, role: newRole }))
                }  />
            )}

            {showFormDelete && (
                <DeleteUser showForm={setShowFormDelete} id={id} userDetails={userDetails} />
            )}
            
            <div className="flex-1 p-8 pt-20 lg:pt-6 lg:ml-65">
                <Link 
                    to={'/UserManagement'} 
                    className="inline-flex items-center text-gray-800 hover:text-gray-900 font-semibold transition-colors mb-6"
                >
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                    </svg>
                    Back to User Management
                </Link>
                
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-md overflow-hidden">
                        <div className="bg-gradient-to-r from-amber-800 to-amber-700 p-6 text-white">
                            <h1 className="text-2xl font-bold">User Details</h1>
                            <p className="opacity-90">ID: {id}</p>
                        </div>
                        
                        <div className="p-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-1">
                                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Personal Information</h2>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600">First Name</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">{userDetails.first_name || 'N/A'}</p>
                                        </div>
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600">Last Name</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">{userDetails.last_name || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Username</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900">{userDetails.username || 'N/A'}</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="space-y-1">
                                    <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Account Information</h2>
                                    <div className="p-4 bg-gray-50 rounded-lg">
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-600">Email Address</label>
                                            <p className="mt-1 text-lg font-semibold text-gray-900 break-all">{userDetails.email || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-600">Role</label>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium mt-1 ${userDetails.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                                {userDetails?.role || 'N/A'}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="mt-8 flex space-x-4">
                                <button 
                                disabled={["Admin", "Staff"].includes(checkRole?.role)}
                                onClick={() => setShowForm(true)}
                                className={`px-4 py-2  bg-amber-800 cursor-pointer text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2 
                                ${["Admin", "Staff"].includes(checkRole?.role) ? "bg-gray-500" : "bg-amber-800"}`}>
                                    Edit User Role
                                </button>
                                <button 
                                disabled={["Admin", "Staff"].includes(checkRole?.role)}
                                onClick={() => setShowFormDelete(true)}
                                className={`px-4 cursor-pointer py-2 bg-red-500 text-white rounded-md transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 ml-auto
                                ${["Admin", "Staff"].includes(checkRole?.role) ? "bg-gray-300 text-gray-500" : "bg-red-100 hover:bg-red-700"}`}>
                                    Terminate Account
                            </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}