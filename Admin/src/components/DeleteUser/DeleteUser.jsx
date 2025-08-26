import axios from "axios";
import { useEffect, useState } from "react"; // Added useState import
import { useNavigate } from "react-router-dom";

export default function DeleteUser({ showForm, id, userDetails }) {
    const navigate = useNavigate();
    const [isDeleting, setIsDeleting] = useState(false); // Added loading state

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/user', {withCredentials: true})
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "") {
                    navigate('/');
                    showForm(false)
                    return;
                } 
            })
    }, []);

    const handleDelete = async (e) => { // Made async for better error handling
        e.preventDefault();
        setIsDeleting(true);
        
        try {
            await axios.post(`https://caferealitea.onrender.com/delete/${id}`);
            showForm(false);
            navigate('/UserManagement');
        } catch (error) {
            console.error("Delete error:", error);
            // Consider adding user feedback here (e.g., toast notification)
        } finally {
            setIsDeleting(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                {/* Warning Icon */}
                <div className="flex justify-center mb-4">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
                        <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                    </div>
                </div>
                
                <h2 className="text-2xl font-bold text-center text-gray-800 mb-2">Delete Account</h2>
                
                <p className="text-gray-600 text-center mb-6">
                    Are you sure you want to delete this account? This action cannot be undone.
                </p>
                
                <div className="bg-red-50 border border-red-100 rounded-lg p-4 mb-6">
                    <h3 className="font-medium text-red-800 mb-2">Account Details</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex">
                            <span className="text-gray-600 w-24">Name:</span>
                            <span className="font-medium">{userDetails.first_name} {userDetails.last_name}</span>
                        </div>
                        <div className="flex">
                            <span className="text-gray-600 w-24">Username:</span>
                            <span className="font-medium">{userDetails.username}</span> {/* Added @ symbol */}
                        </div>
                        <div className="flex">
                            <span className="text-gray-600 w-24">Email:</span>
                            <span className="font-medium">{userDetails.email}</span>
                        </div>
                        <div className="flex">
                            <span className="text-gray-600 w-24">Role:</span>
                            <span className="font-medium capitalize">{userDetails.role}</span>
                        </div>
                    </div>
                </div>
                
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => showForm(false)}
                        disabled={isDeleting} // Disable during deletion
                        className="px-5 py-2.5 text-sm cursor-pointer font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleDelete}
                        disabled={isDeleting} // Disable during deletion
                        className="px-5 cursor-pointer py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg transition-colors duration-200 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
                    >
                        {isDeleting ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Terminating...
                            </>
                        ) : (
                            "Terminate Account"
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
}