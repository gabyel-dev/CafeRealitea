import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faClipboardList, faClockRotateLeft, faGauge, faMugHot, faUser, faUserGear, faUserPlus, faUsers} from '@fortawesome/free-solid-svg-icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { faArrowRightFromBracket } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from 'react';

const logout = <FontAwesomeIcon icon={faArrowRightFromBracket} className='text-amber-300 text-xl ' />


const Dashboard = <FontAwesomeIcon icon={faGauge} className='text-amber-300 ' />
const History = <FontAwesomeIcon icon={faClockRotateLeft} className='text-amber-300 ' />
const OrderManagement = <FontAwesomeIcon icon={faClipboardList} className='text-amber-300 ' />
const Admin = <FontAwesomeIcon icon={faUserGear} className='text-amber-300 ' />
const Account = <FontAwesomeIcon icon={faUserPlus} className='text-amber-300 ' />
const Users = <FontAwesomeIcon icon={faUsers} className='text-amber-300 ' />
const logo = <FontAwesomeIcon icon={faMugHot} className='text-amber-300 text-2xl' />



export default function AdminSidePanel({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [isStaff, setIsStaff] = useState();
    const [userData, setUserData] = useState(null)

    const handleLogout = () => {
        axios.post('https://caferealitea.onrender.com/logout', {}, { withCredentials: true })
            .then(() => navigate('/'))
            .catch(err => {
                console.error("Logout failed:", err);
                // Still navigate to login even if logout request fails
                navigate('/');
            });
    };


            useEffect(() => {
            axios.get('https://caferealitea.onrender.com/user', {withCredentials: true })
                .then((res) => {
                const role = res.data.user?.role;
                setIsStaff(role === "Staff" || role === "Admin"); // true if Staff
                setUserData(res.data)
                
                });
            }, []);



    return (
        <>
        <div className="__sidePanel__ w-65  h-screen flex flex-col justify-between bg-amber-800 fixed">
            

            <div className='flex flex-col'>

                <div className="__Top__ w-full h-17.5 bg-amber-900 text-center flex justify-center items-center gap-2">
                    {logo}
                    <p className="__logo__ text-white text-xl font-bold">
                        Café Realitea
                    </p>
                </div>

                <div className='__Middle__ flex flex-col gap-1 px-4 py-4'>
                <div className={`w-full h-10 flex items-center  text-sm text-amber-100 ${activeTab === "Dashboard" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2  hover:border-0  hover:rounded-md cursor-pointer`} onClick={() =>  { navigate('/dashboard'), setActiveTab("Dashboard") }}>
                    {Dashboard}
                    <p className=' font-semibold'>Dashboard</p>
                </div>

                <div className={`w-full h-10 flex items-center  text-sm text-amber-100 ${activeTab === "Sales" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2  hover:border-0  hover:rounded-md cursor-pointer`} onClick={() => { navigate('/sales'), setActiveTab("Sales")}}>
                    {History}
                    <p className=' font-semibold'>Sales History</p>
                </div>

                <div className={`w-full h-10 flex items-center  text-sm text-amber-100 ${activeTab === "Order" ? "bg-amber-700/20 rounded-md text-white"  : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2  hover:border-0  hover:rounded-md cursor-pointer`} onClick={() => { navigate('/orders'), setActiveTab("Order")}} >
                    {OrderManagement}
                    <p className=' font-semibold'>Order Management</p>
                </div>

                

                <div
                    className={`w-full h-10 flex items-center text-sm 
                                ${!isStaff ? "text-amber-100 cursor-pointer hover:text-white hover:bg-amber-700/20"
                                            : "text-gray-400 cursor-not-allowed"} 
                                ${activeTab === "AccountCreation" ? "bg-amber-700/20 rounded-md text-white" : ""} 
                                gap-2 p-2 hover:border-0 hover:rounded-md`}
                    onClick={!isStaff ? () => { navigate('/CreateAccount'); setActiveTab("AccountCreation"); } : undefined}
                    >
                    {Account}
                    <p className='font-semibold'>Account Creation</p>
                    </div>


                <div className={`w-full h-10 flex items-center  text-sm text-amber-100 ${activeTab === "Users" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2  hover:border-0  hover:rounded-md cursor-pointer`} onClick={() => { navigate('/UserManagement'), setActiveTab("Users")}}>
                    {Users}
                    <p className='font-semibold'>Users Management</p>
                </div>

                <div className={`w-full h-10 flex items-center  text-sm text-amber-100 ${activeTab === "Admin" ? "bg-amber-700/20 rounded-md text-white" : "hover:bg-amber-700/20"} hover:text-white gap-2 p-2  hover:border-0  hover:rounded-md cursor-pointer`} onClick={() => { navigate('/settings'), setActiveTab("Admin")}}>
                    {Admin}
                    <p className='font-semibold'>Settings</p>
                </div>

                
            </div>

            
            </div>

            <div>
                

            <div className='__bottom__ flex gap-2 items-center justify-between w-full border-t-1 border-amber-600/60 px-6 '>
                <div className='flex  gap-2'>
                    <div className='text-amber-700 bg-amber-100 rounded-full px-2 py-2 text-center   ' >
                    {<FontAwesomeIcon icon={faUserGear} className='-translate-y-0.2 -translate-x-0.3 text-lg' /> }
                </div>

                <div className='text-amber-50 items-center -translate-y-0.5'>
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
                        className='h-10 flex items-center text-sm text-amber-100 font-semibold hover:text-white   hover:bg-amber-700/20 hover:border-0  hover:rounded-md cursor-pointer'
                        >
                        {logout}
            
                        
                </button>
            </div>
            </div>
            </div>

        </div>
        </>
    )
}