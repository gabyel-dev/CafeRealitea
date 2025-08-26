import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";



export default function OrderDetails() {
    const { id } = useParams();
    const [OrderDetails, setOrderDetails] = useState({})

    useEffect(() => {
        axios.get(`https://caferealitea.onrender.com/api/order/${id}`)
        .then((res) => {
            setOrderDetails(res.data)
        })
    }, [])

    //api result
    //
    //item_id
    //id
    //order_id
    //price


    return (
        <>
        <div>
            {OrderDetails.item_id}
        </div>
        </>
    )
}