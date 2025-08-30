import AdminSidePanel from "../../../../components/AdminSidePanel";
import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faUser, faArrowRight, faSearch, faCrown, faCircle, faUserShield, faUserTag, faUserTie, faHamburger, faBars, faPlus } from "@fortawesome/free-solid-svg-icons";
import { motion, AnimatePresence } from "framer-motion";



export default function UsersManagement({ activeTab, setActiveTab }) {
    const [users, setUsers] = useState([]);
    const [filteredUsers, setFilteredUsers] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [roleFilter, setRoleFilter] = useState("all");
    const [role, setRole] = useState("")
    const navigate = useNavigate();
    const [isOnline, setIsOnline] = useState({});

    

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
        document.title = "Café Realitea - User Management";
        axios.get('https://caferealitea.onrender.com/users_account', { withCredentials: true })
            .then((res) => {
                setUsers(res.data);
                setFilteredUsers(res.data);

                
                const status = {};
                res.data.forEach(user => {
                  status[user.id] = user.token !== null;
                })
                setIsOnline(status)
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
            case "Admin": return faUserTie;
            case "System Administrator": return faUserShield;
            default: return faUserTag;
        }
    };

    const getRoleColor = (role) => {
        switch(role) {
            case "Admin": return "bg-blue-100 text-blue-800";
            case "System Administrator": return "bg-blue-100 text-blue-900";
            default: return "bg-gray-100 text-gray-800";
        }
    };

    return (
        <>
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
           <div className="min-h-screen lg:ml-65 p-4 md:p-5 lg:p-6 bg-gray-50">
  {/* Page Header */}
  <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3 pt-16 lg:pt-0">
    <div className="flex items-center mb-4 md:mb-0">
      <div className="bg-amber-100 p-3 rounded-lg mr-4">
        <FontAwesomeIcon icon={faUsers} className="text-amber-600 text-lg sm:text-xl md:text-2xl" />
      </div>
      <div>
        <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-gray-800">
          Users Management
        </h1>
        <p className="text-xs sm:text-sm md:text-base text-gray-500">
          Manage all user accounts and permissions
        </p>
      </div>
    </div>

    <Link
      to={["System Administrator"].includes(role) ? "/CreateAccount" : "#"}
      className={`text-white px-3 sm:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg font-medium transition-colors
        text-xs sm:text-sm md:text-base hidden md:block
        ${
          ["System Administrator"].includes(role)
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-gray-400 cursor-not-allowed pointer-events-none"
        }`}
    >
      Add New User
    </Link>
  </div>

  {/* Filters and Search */}
  <div className="flex flex-col-reverse md:flex-col">
  <div className="bg-white p-3 sm:p-4 rounded-xl shadow mb-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="md:col-span-2">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <FontAwesomeIcon icon={faSearch} className="text-gray-400 text-sm sm:text-base" />
          </div>
          <input
            type="text"
            placeholder="Search users by name or email..."
            className="pl-9 pr-3 py-1.5 sm:py-2 w-full border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm md:text-base"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div>
        <select
          className="w-full px-3 sm:px-4 py-1.5 sm:py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:border-amber-500 text-xs sm:text-sm md:text-base"
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
        >
          <option value="all">All Roles</option>
          <option value="Staff">Staff</option>
          <option value="Admin">Admin</option>
          <option value="System Administrator">System Administrator</option>
        </select>
      </div>
    </div>
  </div>

  {/* Stats Overview */}
<div className="md:flex grid gap-4 mb-6">
  {/* Total Users */}
  <div className="bg-white p-3 sm:p-4 rounded-xl shadow border-l-4 border-amber-500 md:w-[30%]">
    <div className="flex justify-between items-center">
      <h3 className="text-xs sm:text-sm md:text-base text-gray-500">Total Users</h3>
      <div className="bg-amber-100 p-2 rounded-lg">
        <FontAwesomeIcon icon={faUsers} className="text-amber-600 text-sm sm:text-base md:text-lg" />
      </div>
    </div>
    <p className="text-lg sm:text-xl md:text-2xl font-bold mt-2">{users.length} Users</p>
  </div>

  {/* Role Filters */}
  <div className="grid grid-cols-3 md:grid-cols-3 md:w-full gap-4">
    {/* Staff */}
    <div
      onClick={() => setRoleFilter("Staff")}
      className={`cursor-pointer transition-all transform hover:scale-105 ${
        roleFilter === "Staff" ? "ring-2 ring-purple-400" : ""
      } bg-white p-3 sm:p-4 rounded-xl shadow border-l-4 border-purple-500`}
    >
      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-between md:items-center ">
        <h3 className="text-xs sm:text-sm md:text-base text-gray-500">Staff</h3>
        <div className="bg-purple-100 p-2 rounded-lg w-9">
          <FontAwesomeIcon icon={faCrown} className="text-purple-600 text-sm sm:text-base md:text-lg" />
        </div>
      </div>
      <p className="text-sm md:text-xl font-bold mt-2">
        {users.filter((user) => user.role === "Staff").length}  
        <span className="hidden md:block"> Staff</span>
      </p>
    </div>

    {/* Admin */}
    <div
      onClick={() => setRoleFilter("Admin")}
      className={`cursor-pointer transition-all transform hover:scale-105 ${
        roleFilter === "Admin" ? "ring-2 ring-blue-400" : ""
      } bg-white p-3 sm:p-4 rounded-xl shadow border-l-4 border-blue-500`}
    >
      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-between md:items-center ">
        <h3 className="text-xs sm:text-sm md:text-base text-gray-500">Admin</h3>
        <div className="bg-blue-100 p-2 rounded-lg w-9">
          <FontAwesomeIcon icon={faUserTie} className="text-blue-600 text-sm sm:text-base md:text-lg" />
        </div>
      </div>
      <p className="text-sm md:text-xl font-bold mt-2">
        {users.filter((user) => user.role === "Admin").length}  
        <span className="hidden md:block"> Admin</span>
      </p>
    </div>

    {/* System Administrator */}
    <div
      onClick={() => setRoleFilter("System Administrator")}
      className={`cursor-pointer transition-all transform hover:scale-105 ${
        roleFilter === "System Administrator" ? "ring-2 ring-blue-800" : ""
      } bg-white p-3 sm:p-4 rounded-xl shadow border-l-4 border-blue-900`}
    >
      <div className="flex flex-col-reverse gap-2 md:flex-row md:justify-between md:items-center ">
        <h3 className="text-xs sm:text-sm md:text-base text-gray-500 leading-tight ">
          <span className="block sm:hidden">SysAdmin</span>
          <span className="hidden sm:block">System Administrator</span>
        </h3>
        <div className="bg-blue-100 p-2 rounded-lg w-9">
          <FontAwesomeIcon icon={faUserShield} className="text-blue-900 text-sm sm:text-base md:text-lg" />
        </div>
      </div>
      <p className="text-sm md:text-xl font-bold mt-2">
        {users.filter((user) => user.role === "System Administrator").length}  
        <span className="hidden md:block"> System Administrator</span>
      </p>
    </div>
  </div>
</div>


  </div>

  {/* User List Card */}
  <div className="bg-white shadow-lg rounded-xl overflow-hidden">
    <div className="border-b border-gray-200 px-4 sm:px-6 py-3 sm:py-4 bg-gray-50">
      <h2 className="text-base sm:text-lg md:text-xl font-semibold text-gray-800">
        User Accounts
      </h2>
    </div>

      
<AnimatePresence>
    {filteredUsers.length === 0 ? (
      <div className="p-6 sm:p-8 text-center">
        <div className="mx-auto w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center bg-gray-100 rounded-full mb-3 sm:mb-4">
          <FontAwesomeIcon icon={faUser} className="text-gray-400 text-lg sm:text-xl" />
        </div>
        <h3 className="text-base sm:text-lg md:text-xl font-medium text-gray-900 mb-1">
          No users found
        </h3>
        <p className="text-xs sm:text-sm md:text-base text-gray-500">
          Try adjusting your search or filter criteria
        </p>
      </div>
    ) : (
      <ul className="">
        {filteredUsers.map((user) => (
          <motion.li
            key={user.id}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.10 }}
      className="p-4 sm:p-5 md:p-6 hover:bg-amber-50 transition-all duration-500 "
          >
            <div className="flex justify-between items-center ">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="flex-shrink-0">
                  <div className="relative w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="text-amber-600 text-sm sm:text-base md:text-lg"
                  />

                  <span className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${
                    isOnline[user.id] ? "bg-green-500" : "bg-gray-300"
                  }`}></span>
                </div>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-gray-800 font-semibold text-sm sm:text-base md:text-lg">
                      {user.first_name} {user.last_name}
                    </span>
                    <span
                      className={`flex items-center pl-1.5 pr-0.5 py-2 md:px-3 lg:px-3 lg:py-1 rounded-full text-[10px] sm:text-xs md:text-xs font-medium ${getRoleColor(
                        user.role
                      )}`}
                    >
                      <FontAwesomeIcon
                        icon={getRoleIcon(user.role)}
                        className="mr-1"
                      />
                      <div className="md:block hidden text-sm md:text-xs">
                        {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                      </div>
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm md:text-md text-gray-500">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Right: View Button */}
              <Link
                to={
                  ["Admin", "System Administrator"].includes(role)
                    ? `user?id=${user.id}&role=${user.role}`
                    : "#"
                }
                onClick={(e) => {
                  if (!["Admin", "System Administrator"].includes(role))
                    e.preventDefault(); // block staff
                }}
                className={`flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 md:py-2.5 rounded-lg font-medium transition-colors
                  text-xs sm:text-sm md:text-base
                  ${
                    ["Admin", "System Administrator"].includes(role)
                      ? "bg-amber-600 cursor-pointer hover:bg-amber-700 text-white"
                      : "bg-gray-400 cursor-not-allowed text-white pointer-events-none"
                  }
                `}
              >
                <span className="hidden md:block">View Details</span>
                <FontAwesomeIcon icon={faBars} />
              </Link>
            </div>
          </motion.li>
        ))}
        
      </ul>
      

      
    )}

    </AnimatePresence>

    <Link
      to={["System Administrator"].includes(role) ? "/CreateAccount" : "#"}
      className={`text-white px-3 sm:px-4 py-1.5 sm:py-4 md:py-2.5 rounded-b-lg font-medium transition-colors
        text-xs sm:text-sm md:text-base block md:hidden text-center 
        ${
          ["System Administrator"].includes(role)
            ? "bg-amber-600 hover:bg-amber-700 text-white"
            : "bg-gray-400 cursor-not-allowed pointer-events-none"
        }`}
    >
      Add New User <FontAwesomeIcon icon={faPlus} />
    </Link>
  </div>
</div>

        </>
    );
}