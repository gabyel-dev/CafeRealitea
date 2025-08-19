import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


export default function AdminDashboard({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [yearData, setYearData] = useState([])
    const [monthData, setMonthData] = useState([])
    
    useEffect(() => {
        axios.get('http://localhost:5000/orders/months')
        .then((res) => {
            setMonthData(res.data)
        })
    }, [])
    
    useEffect(() => {
        axios.get('http://localhost:5000/orders/year')
        .then((res) => {
            setYearData(res.data)
        })
    }, [])

    useEffect(() => {
        document.title = "Café Realitea - Admin Dashboard";
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
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="w-full h-screen text-gray-800">

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 ml-80">
                    <div className="w-full">
                        <h1 className="text-3xl font-bold">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm">
                        </p>
                            Welcome back, <b>{userData.user?.name}</b>! Here's what's happening with Café Realitea today.
                    </div>
                <div className="px-4 py-6 sm:px-0">
                </div>
            </main>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 ml-80">
            {yearData.map((result) => (
            <div key={result.year} className="bg-white shadow rounded-lg p-6">
                <h3 className="text-xl font-semibold text-gray-800">{result.year}</h3>
                <p className="text-gray-600 mt-2">Total Orders: {result.total_orders}</p>
                <p className="text-gray-600">Total Sales: ₱{result.total_sales}</p>
            </div>
            ))}
        </div>

        {/* Monthly Breakdown */}
        <div className="bg-white shadow rounded-lg p-6 ml-80">
            <h3 className="text-2xl font-semibold text-gray-800 mb-4">Monthly Breakdown</h3>
            {monthData.map((result, i) => (
            <div key={`${result.year}-${result.month}`} className="mb-2">
                {/* Show year heading only once */}
                {(i === 0 || monthData[i - 1].year !== result.year) && (
                <h4 className="text-lg font-bold mt-4 mb-2 text-amber-600">{result.year}</h4>
                )}
                <div className="flex justify-between border-b py-2 text-gray-700">
                <span>
                    {new Date(result.year, result.months - 1).toLocaleString("default", { month: "long" })}
                </span>
                <span>{result.total_orders} orders</span>
                <span className="font-medium">₱{result.total_sales}</span>
                </div>
            </div>
            ))}
        </div>
            </div>

        </div>
    );
}