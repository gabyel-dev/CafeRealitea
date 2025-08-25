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

                if (res.data.role !== 'Admin') {
                    navigate(`/${res.data.role}/dashboard`);
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
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
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