import AdminSidePanel from "../../../../components/AdminSidePanel";
import { useState, useEffect } from "react";
import axios from "axios";





export default function SalesHistory({ activeTab, setActiveTab }) {
    const [dailySalesData, setDailySalesData] = useState([])

    
        useEffect(() => {
            axios.get('https://caferealitea.onrender.com/daily-sales')
            .then((res) => {
                setDailySalesData(res.data);
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