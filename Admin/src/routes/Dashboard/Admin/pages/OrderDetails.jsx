import axios from "axios";
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { 
  faArrowLeft, 
  faReceipt, 
  faUser, 
  faUtensils, 
  faCreditCard, 
  faTag,
  faShoppingBasket
} from "@fortawesome/free-solid-svg-icons";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

export default function OrderDetails() {
    const [orderDetails, setOrderDetails] = useState({
        items: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const location = useLocation();
    const query = new URLSearchParams(location.search);
    const id = query.get('id');
    const navigate = useNavigate()


    useEffect(() => {
        axios.get(`https://caferealitea.onrender.com/api/order/${id}`)
        .then((res) => {
            setOrderDetails(res.data);
            setLoading(false);
        })
        .catch((err) => {
            setError("Failed to fetch order details");
            setLoading(false);
            console.error(err);
        });
    }, [id]);

    useEffect(() => {
        document.title = "Café Realitea - Order Details";

        axios.get('https://caferealitea.onrender.com/user', { withCredentials: true })
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "") {
                    navigate('/');
                    return;
                }
                setUserData(res.data);
            })
    }, []);

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

    if (error) {
        return (
            <div className="min-h-screen bg-amber-50 flex items-center justify-center">
                <div className="text-red-600 bg-red-100 p-4 rounded-lg">{error}</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex">
            <AdminSidePanel />
            
            <div className="flex-1 p-6 md:p-8 ml-65">
                {/* Header */}
                <div className="flex items-center mb-6">
                    <Link 
                        to={'/sales'} 
                        className="flex items-center text-amber-700 hover:text-amber-900 transition-colors mr-4"
                    >
                        <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                        Back to Sales
                    </Link>
                    <h1 className="text-3xl font-bold text-gray-800">Order Details</h1>
                </div>

                {/* Order Summary Card */}
                <div className="bg-white rounded-xl shadow-md p-6 mb-6">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                        <div className="flex items-center">
                            <div className="bg-amber-100 p-3 rounded-full mr-4">
                                <FontAwesomeIcon icon={faReceipt} className="text-amber-600 text-xl" />
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold text-gray-800">Order #{orderDetails.order_id}</h2>
                            </div>
                        </div>
                        
                        <div className="mt-4 md:mt-0">
                            <span className={`px-4 py-2 rounded-full text-sm font-medium ${
                                orderDetails.order_type === "Dine-in" 
                                    ? "bg-amber-100 text-amber-800" 
                                    : "bg-purple-100 text-purple-800"
                            }`}>
                                {orderDetails.order_type}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-1  md:grid-cols-3 gap-4  border-t border-amber-100 pt-4 mt-4">
                        <div className="flex items-center">
                            <div className="bg-amber-100 p-2 rounded-full mr-3">
                                <FontAwesomeIcon icon={faUser} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-amber-600">Customer</p>
                                <p className="font-medium text-amber-900">{orderDetails.customer_name}</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="bg-amber-100 p-2 rounded-full mr-3">
                                <FontAwesomeIcon icon={faCreditCard} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-amber-600">Payment Method</p>
                                <p className="font-medium text-amber-900">{orderDetails.payment_method}</p>
                            </div>
                        </div>

                        <div className="flex items-center">
                            <div className="bg-amber-100 p-2 rounded-full mr-3">
                                <FontAwesomeIcon icon={faTag} className="text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm text-amber-600">Total Amount</p>
                                <p className="font-medium text-amber-900">₱{orderDetails.total.toFixed(2)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Order Items */}
                <div className="bg-white rounded-xl shadow-md p-6  ">
                    <div className="flex items-center mb-6">
                        <div className="bg-amber-100 p-2 rounded-full mr-3">
                            <FontAwesomeIcon icon={faShoppingBasket} className="text-amber-600" />
                        </div>
                        <h2 className="text-xl font-semibold text-amber-900">Order Items</h2>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-amber-100">
                                    <th className="text-left py-3 px-4 text-amber-600 font-medium">Item</th>
                                    <th className="text-center py-3 px-4 text-amber-600 font-medium">Price</th>
                                    <th className="text-center py-3 px-4 text-amber-600 font-medium">Quantity</th>
                                    <th className="text-right py-3 px-4 text-amber-600 font-medium">Subtotal</th>
                                </tr>
                            </thead>
                            <tbody>
                                {orderDetails.items.map((item, index) => (
                                    <tr key={index} className="border-b border-amber-50 hover:bg-amber-50 transition-colors">
                                        <td className="py-4 px-4">
                                            <div className="flex items-center">
                                                <div className="bg-amber-100 text-amber-800 rounded-lg w-10 h-10 flex items-center justify-center mr-3">
                                                    <FontAwesomeIcon icon={faUtensils} />
                                                </div>
                                                <span className="font-medium text-amber-900">{item.name}</span>
                                            </div>
                                        </td>
                                        <td className="py-4 px-4 text-center text-amber-700">₱{item.price.toFixed(2)}</td>
                                        <td className="py-4 px-4 text-center text-amber-700">{item.quantity}</td>
                                        <td className="py-4 px-4 text-right font-medium text-amber-900">₱{item.subtotal.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan="3" className="py-4 px-4 text-right font-bold text-amber-800">Total</td>
                                    <td className="py-4 px-4 text-right font-bold text-amber-900 text-lg">₱{orderDetails.total.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}