import axios from "axios";
import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faUser, 
  faEnvelope, 
  faKey, 
  faShieldAlt, 
  faBell, 
  faPalette,
  faSave,
  faEdit
} from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import AdminSidePanel from "../../../../components/AdminSidePanel";

export default function Settings() {
  const [userDetails, setUserDetails] = useState({});
  const [formData, setFormData] = useState({});
  const [activeTab, setActiveTab] = useState("profile");
  const [editable, setEditable] = useState(false);

  const setCancel = () => {
    setFormData(userDetails)
    setEditable(false)
  }

  const handleChangeData = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value})
  }

  useEffect(() => {
    axios.get('https://caferealitea.onrender.com/user', {withCredentials: true})
    .then((res) => {
      setUserDetails(res.data.user)
      setFormData(res.data.user)
    })
  }, []);

  return (
    <div className="flex h-screen bg-gray-50">
      <AdminSidePanel />
      
      <div className="flex-1 p-8 overflow-auto lg:ml-65 pt-20 lg:pt-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Settings</h1>
        <p className="text-gray-600 mb-8">Manage your account settings and preferences</p>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-gray-200 mb-6">
          <button
            className={`px-4 py-2 font-medium flex items-center ${activeTab === "profile" ? "text-amber-600 border-b-2 border-amber-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("profile")}
          >
            <FontAwesomeIcon icon={faUser} className="mr-2" />
            Profile
          </button>
          <button
            className={`px-4 py-2 font-medium flex items-center ${activeTab === "security" ? "text-amber-600 border-b-2 border-amber-600" : "text-gray-500"}`}
            onClick={() => setActiveTab("security")}
          >
            <FontAwesomeIcon icon={faShieldAlt} className="mr-2" />
            Security
          </button>
        </div>
        
        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FontAwesomeIcon icon={faUser} className="text-amber-500 mr-2" />
              Profile Information
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                <input
                  type="text"
                  name="first_name"
                  value={formData.first_name}
                  className={`${!editable ? "bg-gray-200" : "bg-white"} w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500`}
                  readOnly={!editable}
                  disabled={!editable}
                  onChange={handleChangeData}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                <input
                  type="text"
                  name="last_name"
                  value={formData.last_name}
                  className={`${!editable ? "bg-gray-200" : "bg-white"} w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500`}
                  readOnly={!editable}
                  disabled={!editable}
                  onChange={handleChangeData}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
                <input
                  type="text"
                  name="username"
                  value={formData.username}
                  className={`${!editable ? "bg-gray-200" : "bg-white"} w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500`}
                  readOnly={!editable}
                  disabled={!editable}
                  onChange={handleChangeData}
                />
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                  <FontAwesomeIcon icon={faEnvelope} className="text-gray-400 mr-2 text-sm" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  className={`${!editable ? "bg-gray-200" : "bg-white"} w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500`}
                  readOnly={!editable}
                  disabled={!editable}
                  onChange={handleChangeData}
                />
              </div>
            </div>
          </div>
        )}
        
        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
              <FontAwesomeIcon icon={faShieldAlt} className="text-amber-500 mr-2" />
              Security Settings
            </h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3 flex items-center">
                  <FontAwesomeIcon icon={faKey} className="text-gray-400 mr-2 text-sm" />
                  Change Password
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-amber-500 focus:border-amber-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        

        <div className="flex justify-end gap-3">
            <div className="flex justify-end ">
          {!editable ? (

             <button 
                onClick={() => setEditable(true)}
                className={`${!editable ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-gray-500 text-white" } flex items-center px-6 py-3  rounded-lg shadow-md  transition-colors`}>
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Edit
          </button>
            
          ) : (
           <button 
                onClick={setCancel}
                className={`${!editable ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-gray-500 text-white" } flex items-center px-6 py-3  rounded-lg shadow-md  transition-colors`}>
                    <FontAwesomeIcon icon={faSave} className="mr-2" />
            Cancel
          </button>
          )}
          </div>

        
        
        {/* Edit Button */}
        <div className="flex justify-end ">
          <button 
          disabled={editable}
          className={`${editable ? "bg-amber-500 text-white hover:bg-amber-600" : "bg-gray-500 text-white" } flex items-center px-6 py-3  rounded-lg shadow-md  transition-colors`}>
            <FontAwesomeIcon icon={faSave} className="mr-2" />
            Save Changes
          </button>
        </div>
        </div>
          </div>
    </div>
  );
}