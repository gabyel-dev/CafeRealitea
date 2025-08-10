import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import SidePanel from "../../../../components/SidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function AdminDashboard({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([])

    useEffect(() => {
        axios.get('http://localhost:5000/items')
        .then((res) => setCategories(res.data))
    }, [])

    
    useEffect(() => {
        document.title = "Café Realitea - Admin";
        setLoading(true);
        
        axios.get('http://localhost:5000/user', { withCredentials: true })
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "") {
                    navigate('/login');
                    return;
                }

                if (res.data.role !== 'Admin') {
                    navigate(`/dashboard/${res.data.role}`);
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
            <div className="w-full h-screen text-gray-800">

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                    <div className="w-full">
                        <h1 className="text-3xl font-bold">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm">
                            Welcome back! Here's what's happening with Cafe Realitea today.
                        </p>
                    </div>
                <div className="px-4 py-6 sm:px-0">
                    
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Welcome, {userData?.user?.name || 'Admin Member'}!
                        </h2>
                        <p className="text-gray-600">
                            You have successfully logged in as a Admin member.
                        </p>
                    </div>
                </div>
            </main>

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