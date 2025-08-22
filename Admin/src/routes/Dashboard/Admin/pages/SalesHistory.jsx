import AdminSidePanel from "../../../../components/AdminSidePanel";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";




export default function SalesHistory({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [dailySalesData, setDailySalesData] = useState([])

    
        useEffect(() => {
            axios.get('https://caferealitea.onrender.com/daily-sales')
            .then((res) => {
                setDailySalesData(res.data);
            })
        }, [])

        useEffect(() => {
            axios.get('https://caferealitea.onrender.com/user')
            .then((res) => {
                if (res.data.logged_in) {
                    navigate(`${res.data.user.role}/dashboard`)
                }
            })
        }, [])


    return (
        <>
        <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
        <div className="ml-80 py-6 px-8">
            <div className="w-full ">
                <h1 className="text-3xl font-bold">Sales History</h1>
                View and manage all sales records
            </div>

            {dailySalesData.map((res) => (
                <div key={res.id}>
                    <p>
                        {res.order_time} - {res.payment_method} - {res.total}
                    </p>
                </div>
            ))}
        </div>
        </>
    )
}