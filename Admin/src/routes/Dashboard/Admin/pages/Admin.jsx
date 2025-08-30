import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate, Link } from "react-router-dom";
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MonthlyGraph from "../../../../components/DashboardGraphs/Admin/MonthlySales";
import { faCoffee, faPesoSign } from "@fortawesome/free-solid-svg-icons";

export default function AdminDashboard({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [currentMonthData, setCurrentMonthData] = useState([]);
    const [PopularItems, setPopularItems] = useState([]);
    const [fetchSales, setFetchSales] = useState([]);
    const [totalSale, setTotalSale] = useState()

    const format = (data) => {
        return parseInt(data).toLocaleString();
    };

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/recent-sales')
            .then((res) => setFetchSales(res.data));
    }, []);

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/orders/current-month')
            .then((res) => setCurrentMonthData(res.data));
    }, []);

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/orders/year')
            .then((res) => {
               const sum = parseInt(res.data.total_sales).reduce((curr, add) => add + curr, 0)
               setTotalSale(sum)
            });
    }, []);

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/top_items')
            .then((res) => setPopularItems(res.data));
    }, []);

    useEffect(() => {
        document.title = "Café Realitea - Dashboard";
        setLoading(true);

        axios.get('https://caferealitea.onrender.com/user', { withCredentials: true })
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "") {
                    navigate('/');
                    return;
                } else {
                    navigate('/dashboard');
                }
                setUserData(res.data);
            })
            .catch((err) => {
                console.error("Authentication check failed:", err);
                navigate('/');
            })
            .finally(() => setLoading(false));
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex flex-col justify-center items-center h-screen bg-amber-50">
                {/* Coffee Loading Animation */}
                <div className="relative">
                    <div className="w-16 h-12 border-4 border-amber-900 rounded-b-xl rounded-t-sm overflow-hidden">
                        <div
                            className="absolute bottom-0 left-0 w-full bg-amber-700 transition-all duration-2000"
                            style={{
                                height: '0%',
                                animation: 'coffeeFill 1.5s ease-in-out forwards',
                                animationDelay: '0.3s'
                            }}
                        ></div>
                    </div>
                    <div className="absolute -top-0.5 -inset-x-0.5 h-1 bg-amber-900 rounded-t-sm"></div>
                    <div className="absolute -bottom-2 -inset-x-4 h-2 bg-amber-200 rounded-full"></div>
                </div>
                <p className="mt-6 text-amber-900 font-medium text-sm sm:text-base lg:text-lg">
                    Brewing your experience...
                </p>
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
        <div className="h-screen flex bg-gray-50 lg:pt-0 pt-15">
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="w-full h-screen text-gray-800">
                <main className="max-w-7xl mx-auto py-4 px-4 md:px-8 ml-0 lg:ml-65">
                    <div className="w-full">
                        <h1 className="text-2xl sm:text-3xl lg:text-3xl font-bold">
                            Dashboard Overview
                        </h1>
                        <p className="text-sm sm:text-base lg:text-md text-gray-500 mt-1">
                            Welcome back, <b>{userData?.user?.first_name}</b>! Here's what's happening with Café Realitea today.
                        </p>
                    </div>
                </main>

                <div className="lg:ml-65 lg:flex gap-6 px-4 md:px-8 mb-5">
                    <div className="__profit__ w-full shadow-md bg-white rounded-lg mb-6">
                        <MonthlyGraph nameOfData={"This Month Sales"} valOfData={"2000"} />
                    </div>

                    <div className="flex flex-col md:flex md:flex-row lg:flex lg:flex-col gap-6 lg:w-[50%]">
                        {/* Monthly Sales */}
                        <div className="__monthlysales__ shadow-md w-full p-6 bg-white rounded-md">
                            {currentMonthData.map((res) => (
                                <div key={res.month} className="flex flex-col">
                                    <div>
                                        <div className="flex justify-between">
                                            <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-500">
                                            Monthly Sales
                                            </p>
                                            {totalSale}
                                        </div>
                                        <div className="__monthly_sales flex items-center justify-between pb-4">
                                            <p className="text-xl sm:text-2xl lg:text-3xl font-bold">
                                                ₱ {format(res.total_sales)}
                                            </p>
                                            <FontAwesomeIcon icon={faPesoSign} className="m-4 bg-amber-100 px-2 py-4.5 rounded-full text-amber-700" />
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="__orders_today">
                                            <p className="text-xs sm:text-sm text-gray-400">Orders This Month</p>
                                            <p className="font-semibold text-sm sm:text-base">{res.total_orders}</p>
                                        </div>
                                        <div className="__avg_order__">
                                            <p className="text-xs sm:text-sm text-gray-400">Avg Order</p>
                                            <p className="font-semibold text-sm sm:text-base">
                                                ₱{(res.total_sales / res.total_orders).toFixed(2)}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Popular Items */}
                        <div className="__monthlysales__ shadow-md w-full px-6 bg-white rounded-md h-fit pb-6  lg:pb-6">
                            <div className="__popular_items__ flex items-center justify-between py-6">
                                <p className="text-sm sm:text-base lg:text-lg font-semibold text-gray-500">
                                    Popular Items
                                </p>
                            </div>
                            {PopularItems.map((res) => (
                                <div key={res.item_id} className="flex justify-between items-center pb-3">
                                    <div className="flex gap-4 items-center">
                                        <FontAwesomeIcon icon={faCoffee} className="bg-amber-100 text-amber-600 px-3 py-2 rounded-sm" />
                                        <p className="text-sm sm:text-base lg:text-lg">{res.product_name}</p>
                                    </div>
                                    <p className="font-semibold text-sm sm:text-base">{res.total_quantity} Sales</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Recent Sales */}
                <div className="lg:ml-65 px-4 lg:px-8 bg-gray-50 pb-8">
                    <div className="bg-white rounded-lg w-full shadow-md">
                        <div className="border-b-1 border-gray-300 py-6 px-6">
                            <h1 className="text-base sm:text-lg lg:text-xl font-semibold">Recent Sales</h1>
                        </div>

                        <div>
                            {fetchSales.map((res) => (
                                <div key={res.id} className="border-b-1 border-gray-200 flex items-center justify-between px-6 py-3">
                                    <p className="text-sm sm:text-base lg:text-lg font-semibold">
                                        Order #{res.id}
                                    </p>
                                    <div className="flex flex-col items-end">
                                        <p className="text-sm sm:text-base lg:text-lg font-semibold">
                                            ₱{format(res.total)}
                                        </p>
                                        <p className="text-xs sm:text-sm text-gray-500">{res.order_time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="text-center py-4 text-amber-600 hover:text-amber-900 font-semibold">
                            <Link to={"/sales"} className="text-sm sm:text-base">
                                View all sales
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
