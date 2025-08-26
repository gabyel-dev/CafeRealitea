import { useState } from "react";
import axios from "axios";

export default function EditUser({ showForm, id }) {
    const [role, setRole] = useState("");    

    const handleChangeRole = async (e) => {
        e.preventDefault();

        try {
            await axios.post("https://caferealitea.onrender.com/update_role", {
                id: id,
                role: role,   // send the selected role
            });
            showForm(false); // close modal
        } catch (err) {
            console.error("Error updating role:", err);
        }
    };

    const handleChange = (e) => {
        setRole(e.target.value);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Blurred Background */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm"></div>
            
            {/* Modal Container */}
            <div className="relative bg-white rounded-xl shadow-2xl p-6 w-full max-w-md mx-4">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">Edit User Role</h2>
                
                {/* Dropdown */}
                <div className="space-y-4 mb-8">
                    <select 
                        name="role" 
                        value={role} 
                        onChange={handleChange}
                        className="w-full border p-2 rounded-lg"
                    >
                        <option value="">-- Select Role --</option>
                        <option value="Staff">Staff</option>
                        <option value="Admin">Admin</option>
                        <option value="System Administrator">System Administrator</option>
                    </select>
                </div>
                
                {/* Buttons */}
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={() => showForm(false)}
                        className="px-5 py-2.5 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors duration-200"
                    >
                        Cancel
                    </button>
                    <button 
                        onClick={handleChangeRole}
                        className="px-5 py-2.5 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors duration-200 shadow-sm"
                        disabled={!role} // disable if no role selected
                    >
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
}
