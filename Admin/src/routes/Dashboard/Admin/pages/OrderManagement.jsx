import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidePanel from "../../../../components/SidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreateOrder from "./OrderManagementComponents/CreateOrder";
import OrderSummary from "./OrderManagementComponents/OrderSummary";


export default function OrderManagementAdmin({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([])

    useEffect(() => {
        axios.get('http://localhost:5000/items')
        .then((res) => setCategories(res.data))
    }, [])

    
    useEffect(() => {
        document.title = "Café Realitea - Order Management";
        setLoading(true);
        
        axios.get('http://localhost:5000/user', { withCredentials: true })
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "") {
                    navigate('/login');
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
                navigate('/login');
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
        <div className="min-h-screen bg-gray-50 flex">
            <SidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="w-full h-screen text-gray-800 ">

            <main className="max-w-7xl mx-auto py-6  sm:px-6 lg:px-8 ml-80">
                    <div className="w-full">
                        <h1 className="text-3xl font-bold">
                            Order Management
                        </h1>
                        <p className="text-sm">
                        </p>
                            Create and manage customer orders
                    </div>
            </main>

            <div className="flex flex-row px-8 gap-6 ml-80 pb-8">
                <CreateOrder />
                <OrderSummary />
            </div>

            {/* {categories.map((cat) => (
                <div key={cat.category_id}>
                    <p>{cat.category_name}</p>
                    {cat.items.map((item) => (
                        <p key={item.id}>{item.name}</p>
                    ))}

                    {cat.items.map((item) => (
                        <p key={item.id}>{item.price}</p>
                    ))}
                </div>
            ))} */}
            </div>

        </div>
    );
}