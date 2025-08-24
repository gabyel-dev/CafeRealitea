import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import MonthlyGraph from "../../../../components/DashboardGraphs/Admin/MonthlySales";
import { faCoffee, faPesoSign, faStar } from "@fortawesome/free-solid-svg-icons";


export default function AdminDashboard({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [yearData, setYearData] = useState([])
    const [monthData, setMonthData] = useState([])
    const [currentMonthData, setCurrentMonthData] = useState([])
    const [PopularItems, setPopularItems] = useState([])
    const [fetchSales, setFetchSales] = useState([])

    const format = (data) => {
        return parseInt(data).toLocaleString();
    }

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/daily-sales')
        .then((res) => {
            
            setFetchSales(res.data);
        }) 
    }, [])

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/orders/current-month')
        .then((res) => {
            
            setCurrentMonthData(res.data);
        }) 
    }, [])

    useEffect(() => {
        axios.get('https://caferealitea.onrender.com/top_items')
        .then((res) => {
            setPopularItems(res.data);
        })
    }, [])

    useEffect(() => {
        document.title = "Café Realitea - Admin Dashboard";
        setLoading(true);
        
        axios.get('https://caferealitea.onrender.com/user', { withCredentials: true })
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
                        <p className="text-md text-gray-500">
                             Welcome back, <b>{userData?.user?.name}</b>! Here's what's happening with Café Realitea today.
                        </p>
                           
                    </div>

            </main>

            <div className="ml-80 flex gap-6 px-8 mb-10">
                <div className="__profit__ w-full shadow-md bg-white rounded-lg">
                        <div>
                            <MonthlyGraph nameOfData={"This Month Sales"} valOfData={"2000"} />
                        </div>

                </div>  

                <div className="flex flex-col gap-6 lg:w-[50%]">
                    <div className="__monthlysales__ shadow-md w-full p-6 bg-white rounded-md">
                        
                        <div>
                            {currentMonthData.map((res) => (
                                <div key={res.month} className="flex flex-col " >
                                    <div>
                                        <p className="text-lg font-semibold text-gray-500">Monthly Sales</p>
                                        <div  className="__monthly_sales flex items-center justify-between pb-4">
                                            <p className="text-3xl font-bold">₱ {format(res.total_sales)}</p>
                                            {<FontAwesomeIcon icon={faPesoSign} className="m-4 bg-amber-100 px-2 py-4.5 rounded-full text-amber-700" />}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between ">
                                        <div className="__orders_today">
                                        <p className="text-sm text-gray-400">Orders This Month  </p>
                                            <p className="font-semibold">{res.total_orders}</p>
                                        </div>

                                        <div className="__avg_order__">
                                            <p className="text-sm text-gray-400">Avg Order  </p>
                                            <p className="font-semibold ">₱{(res.total_sales / res.total_orders).toFixed(2)}</p>
                                        </div>
                                    </div>
                                </div>
                                
                            ))}
                        </div>
                    </div>

                    <div className="__monthlysales__ shadow-md w-full px-6 bg-white rounded-md pb-6 h-full">
                            <div  className="__popular_items__ flex items-center justify-between py-6">
                                <p className="text-lg font-semibold text-gray-500">Popular Items</p>
                            </div>
                            
                                {PopularItems.map((res) => (
                                <div key={res.item_id} className="flex justify-between  items-center pb-3">
                                    <div className="flex gap-4 items-center">
                                        {<FontAwesomeIcon icon={faCoffee} className="bg-amber-100 text-amber-600 px-3 py-2 rounded-sm" />}
                                        <p>{res.product_name}</p>
                                    </div>
                                    <p className="font-semibold">{res.total_quantity} Sales</p>
                                </div>
                            ))}
                    </div>
                </div>
            </div>

            <div className=" ml-80 px-8">
                <div className="bg-white rounded-lg w-full p-8 shadow-md">
                    <div className="w-full  ">
                        <h1>Recent Sales</h1>

                        <div>
                            {fetchSales.map((res) => (
                                <div key={res.id} className="border-b-1 border-gray-200 flex items-center justify-between">
                                    <p>Order #{res.id} </p>

                                    <div >
                                        <p>{res.total} </p>
                                        <p>{res.order_time}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>


                </div>
                
            </div>

            </div>

        </div>
    );
}