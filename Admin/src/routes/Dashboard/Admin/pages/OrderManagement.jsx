import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreateOrder from "./OrderManagementComponents/CreateOrder";
import OrderSummary from "./OrderManagementComponents/OrderSummary";


export default function OrderManagementAdmin({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([])

    const [itemsAdded, setItemsAdded] = useState([]);

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/items')
        .then((res) => setCategories(res.data))
    }, [])

    
    useEffect(() => {
        document.title = "Café Realitea - Order Management";
        setLoading(true);
        
        axios.get('https://caferealitea.onrender.com/user', { withCredentials: true })
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "") {
                    navigate('/');
                    return;
                }

               

                setUserData(res.data);
            })
            .catch((err) => {
                console.error("Authentication check failed:", err);
                navigate('/');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    if (loading) {
    return (
        <div className="flex flex-col justify-center items-center h-screen bg-amber-50">
            {/* Coffee Icon */}
            <div className="relative">
                {/* Cup */}
                <div className="w-16 h-12 border-4 border-amber-900 rounded-b-xl rounded-t-sm overflow-hidden">
                    {/* Liquid Fill - Now fills from bottom up */}
                    <div 
                        className="absolute bottom-0 left-0 w-full bg-amber-700 transition-all duration-2000"
                        style={{ 
                            height: '0%',
                            animation: 'coffeeFill 1.5s ease-in-out forwards',
                            animationDelay: '0.3s'
                        }}
                    ></div>
                </div>
                
                {/* Cup rim (to cover the top of the liquid) */}
                <div className="absolute -top-0.5 -inset-x-0.5 h-1 bg-amber-900 rounded-t-sm"></div>
                
                {/* Plate */}
                <div className="absolute -bottom-2 -inset-x-4 h-2 bg-amber-200 rounded-full"></div>
            </div>
            
            {/* Text */}
            <p className="mt-6 text-amber-900 font-medium">Brewing your experience...</p>
            
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
        <div className="bg-gray-50 flex">
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="w-full h-screen text-gray-800">
                <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ml-65">
                    <div className="w-full">
                        <h1 className="text-3xl font-bold">Order Management</h1>
                        Create and manage customer orders
                    </div>
                </main>

                <div className="flex flex-row px-8 gap-6 ml-65 pb-8 bg-gray-50">
                    <CreateOrder categories={categories} setItemsAdded={setItemsAdded} itemsAdded={itemsAdded} />
                    <OrderSummary itemsAdded={itemsAdded} />
                </div>
            </div>
        </div>
    );
}