import { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faBars, faXmark, faClipboardList, faClockRotateLeft, 
  faGauge, faMugHot, faUserGear, faUserPlus, 
  faUsers, faArrowRightFromBracket 
} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

// Icon assignments
const DashboardIcon = <FontAwesomeIcon icon={faGauge} className='text-amber-300' />;
const HistoryIcon = <FontAwesomeIcon icon={faClockRotateLeft} className='text-amber-300' />;
const OrderManagementIcon = <FontAwesomeIcon icon={faClipboardList} className='text-amber-300' />;
const AdminIcon = <FontAwesomeIcon icon={faUserGear} className='text-amber-300' />;
const AccountIcon = <FontAwesomeIcon icon={faUserPlus} className='text-amber-300' />;
const UsersIcon = <FontAwesomeIcon icon={faUsers} className='text-amber-300' />;
const LogoutIcon = <FontAwesomeIcon icon={faArrowRightFromBracket} className='text-amber-300 text-xl' />;
const LogoIcon = <FontAwesomeIcon icon={faMugHot} className='text-amber-300 text-2xl' />;
const MenuIcon = <FontAwesomeIcon icon={faBars} className='text-amber-300 text-xl' />;
const CloseIcon = <FontAwesomeIcon icon={faXmark} className='text-amber-300 text-xl' />;

export default function AdminSidePanel({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [isStaff, setIsStaff] = useState(false);
  const [userData, setUserData] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    axios.post('https://caferealitea.onrender.com/logout', {}, { withCredentials: true })
      .then(() => navigate('/'))
      .catch(err => {
        console.error("Logout failed:", err);
        navigate('/');
      });
  };

  useEffect(() => {
    axios.get('https://caferealitea.onrender.com/user', { withCredentials: true })
      .then((res) => {
        const role = res.data.user?.role;
        setIsStaff(role === "Staff" || role === "Admin");
        setUserData(res.data);
      });
  }, []);

  // Mobile navbar component
  const MobileNavbar = () => (
    <div className="lg:hidden fixed top-0 left-0 right-0 z-50 bg-amber-800 shadow-md">
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          {LogoIcon}
          <p className="text-white text-xl font-bold">Café Realitea</p>
        </div>
        
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 rounded-md bg-amber-700/30 hover:bg-amber-700/50 transition-colors"
        >
          {mobileMenuOpen ? CloseIcon : MenuIcon}
        </button>
      </div>
      
      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-0 right-0 bg-amber-800 shadow-lg border-t border-amber-700">
          <div className="flex flex-col py-2 px-4">
            <MobileNavItem 
              icon={DashboardIcon} 
              label="Dashboard" 
              onClick={() => { navigate('/dashboard'); setActiveTab("Dashboard"); setMobileMenuOpen(false); }}
              isActive={activeTab === "Dashboard"}
            />
            
            <MobileNavItem 
              icon={HistoryIcon} 
              label="Sales History" 
              onClick={() => { navigate('/sales'); setActiveTab("Sales"); setMobileMenuOpen(false); }}
              isActive={activeTab === "Sales"}
            />
            
            <MobileNavItem 
              icon={OrderManagementIcon} 
              label="Order Management" 
              onClick={() => { navigate('/orders'); setActiveTab("Order"); setMobileMenuOpen(false); }}
              isActive={activeTab === "Order"}
            />
            
            <MobileNavItem 
              icon={AccountIcon} 
              label="Account Creation" 
              onClick={!isStaff ? () => { navigate('/CreateAccount'); setActiveTab("AccountCreation"); setMobileMenuOpen(false); } : undefined}
              isActive={activeTab === "AccountCreation"}
              disabled={isStaff}
            />
            
            <MobileNavItem 
              icon={UsersIcon} 
              label="Users Management" 
              onClick={() => { navigate('/UserManagement'); setActiveTab("Users"); setMobileMenuOpen(false); }}
              isActive={activeTab === "Users"}
            />
            
            <MobileNavItem 
              icon={AdminIcon} 
              label="Settings" 
              onClick={() => { navigate('/settings'); setActiveTab("Admin"); setMobileMenuOpen(false); }}
              isActive={activeTab === "Admin"}
            />

            <button
                onClick={handleLogout}
                className="w-full mt-2 flex items-center gap-2 p-2 text-amber-100 font-semibold hover:bg-amber-700/20 rounded-md transition-colors ml-1"
              >
                {LogoutIcon}
                <span>Logout</span>
              </button>
            
            <div className="border-t border-amber-700 my-2 pt-2">
              <div className="flex items-center justify-between px-2 py-1 text-amber-100">
                <div className="flex items-center gap-2">
                  <div className="text-amber-700 bg-amber-100 rounded-full p-2">
                    <FontAwesomeIcon icon={faUserGear} className="text-lg" />
                  </div>
                  <div>
                    <p className="font-semibold text-sm">
                      {userData?.user?.first_name} {userData?.user?.last_name}
                    </p>
                    <p className="text-xs text-amber-200">
                      {userData?.user?.email}
                    </p>
                  </div>
                </div>
              </div>
              
              
            </div>
          </div>
        </div>
      )}
    </div>
  );

  // Mobile nav item component
  const MobileNavItem = ({ icon, label, onClick, isActive, disabled = false }) => (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center gap-2 p-3 my-1 rounded-md text-left transition-colors
        ${isActive ? "bg-amber-700/30 text-white" : "text-amber-100 hover:bg-amber-700/20 hover:text-white"}
        ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      {icon}
      <span className="font-semibold">{label}</span>
    </button>
  );

  return (
    <>
      {/* Mobile Navigation */}
      <MobileNavbar />
      
      {/* Desktop Side Panel (unchanged) */}
      <div className="__sidePanel__ w-65 h-screen lg:flex flex-col justify-between bg-amber-800 fixed hidden">
        {/* ... your existing desktop side panel code ... */}
        <div className='flex flex-col'>
          <div className="__Top__ w-full h-17.5 bg-amber-900 text-center flex justify-center items-center gap-2">
            {LogoIcon}
            <p className="__logo__ text-white text-xl font-bold">
              Café Realitea
            </p>
          </div>

          <div className='__Middle__ flex flex-col gap-1 px-4 py-4'>
            <div className={`w-full h-10 flex items-center text-sm text-amber-100 ${activeTab === "Dashboard" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2 hover:border-0 hover:rounded-md cursor-pointer`} onClick={() => { navigate('/dashboard'); setActiveTab("Dashboard") }}>
              {DashboardIcon}
              <p className='font-semibold'>Dashboard</p>
            </div>

            <div className={`w-full h-10 flex items-center text-sm text-amber-100 ${activeTab === "Sales" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2 hover:border-0 hover:rounded-md cursor-pointer`} onClick={() => { navigate('/sales'); setActiveTab("Sales")}}>
              {HistoryIcon}
              <p className='font-semibold'>Sales History</p>
            </div>

            <div className={`w-full h-10 flex items-center text-sm text-amber-100 ${activeTab === "Order" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2 hover:border-0 hover:rounded-md cursor-pointer`} onClick={() => { navigate('/orders'); setActiveTab("Order")}} >
              {OrderManagementIcon}
              <p className='font-semibold'>Order Management</p>
            </div>

            <div
              className={`w-full h-10 flex items-center text-sm 
                          ${!isStaff ? "text-amber-100 cursor-pointer hover:text-white hover:bg-amber-700/20"
                                      : "text-gray-400 cursor-not-allowed"} 
                          ${activeTab === "AccountCreation" ? "bg-amber-700/20 rounded-md text-white" : ""} 
                          gap-2 p-2 hover:border-0 hover:rounded-md`}
              onClick={!isStaff ? () => { navigate('/CreateAccount'); setActiveTab("AccountCreation"); } : undefined}
            >
              {AccountIcon}
              <p className='font-semibold'>Account Creation</p>
            </div>

            <div className={`w-full h-10 flex items-center text-sm text-amber-100 ${activeTab === "Users" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2 hover:border-0 hover:rounded-md cursor-pointer`} onClick={() => { navigate('/UserManagement'); setActiveTab("Users")}}>
              {UsersIcon}
              <p className='font-semibold'>Users Management</p>
            </div>

            <div className={`w-full h-10 flex items-center text-sm text-amber-100 ${activeTab === "Admin" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2 hover:border-0 hover:rounded-md cursor-pointer`} onClick={() => { navigate('/settings'); setActiveTab("Admin")}}>
              {AdminIcon}
              <p className='font-semibold'>Settings</p>
            </div>
          </div>
        </div>

        <div>
          <div className='__bottom__ flex gap-2 items-center justify-between w-full border-t-1 border-amber-600/60 px-6 '>
            <div className='flex gap-2'>
              <div className='text-amber-700 bg-amber-100 rounded-full px-2 py-2 text-center'>
                <FontAwesomeIcon icon={faUserGear} className='text-lg' />
              </div>

              <div className='text-amber-50 items-center'>
                <p className='font-semibold'>
                  {userData?.user?.first_name} {userData?.user?.last_name}
                </p>
                <p className='text-xs text-amber-200'>
                  {userData?.user?.email}
                </p>
              </div>
            </div>

            <div className='__Middle__ flex flex-col gap-1 px-4 py-4'>
              <button
                onClick={handleLogout}
                className='h-10 flex items-center text-sm text-amber-100 font-semibold hover:text-white hover:bg-amber-700/20 hover:border-0 hover:rounded-md cursor-pointer'
              >
                {LogoutIcon}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}