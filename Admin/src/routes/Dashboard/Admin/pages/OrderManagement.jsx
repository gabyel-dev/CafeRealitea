import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreateOrder from "./OrderManagementComponents/CreateOrder";
import OrderSummary from "./OrderManagementComponents/OrderSummary";
import { faListCheck, faBell } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";
import PendingOrdersModal from "../../../../components/PendingOrdersModal";

const socket = io("https://caferealitea.onrender.com", {
  withCredentials: true,
  transports: ["websocket"],
});

export default function OrderManagementAdmin({ activeTab, setActiveTab }) {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [itemsAdded, setItemsAdded] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    axios.get("https://caferealitea.onrender.com/items")
      .then((res) => setCategories(res.data));
  }, []);

  useEffect(() => {
    document.title = "Café Realitea - Order Management";
    setLoading(true);

    axios.get("https://caferealitea.onrender.com/user", { withCredentials: true })
      .then((res) => {
        if (!res.data.logged_in || res.data.role === "") {
          navigate("/");
          return;
        }
        setUserData(res.data);
      })
      .catch((err) => {
        console.error("Authentication check failed:", err);
        navigate("/");
      })
      .finally(() => {
        setLoading(false);
      });
  }, [navigate]);

  // 🔥 Socket.io notifications for pending orders
  useEffect(() => {
    socket.on("new_pending_order", (data) => {
      console.log("📢 New Pending Order:", data);
      
      // Add to notifications list
      setNotifications(prev => [data, ...prev]);
      
      // Show alert for new pending orders
      if (userData?.role === 'Admin' || userData?.role === 'System Administrator') {
        alert(`🆕 New Pending Order!\nCustomer: ${data.customer_name}\nTotal: ₱${data.total}`);
      }
    });

    socket.on("order_confirmed", (data) => {
      console.log("✅ Order Confirmed:", data);
      setNotifications(prev => [data, ...prev]);
    });

    socket.on("order_cancelled", (data) => {
      console.log("❌ Order Cancelled:", data);
      setNotifications(prev => [data, ...prev]);
    });

    // Register user with socket
    if (userData?.id) {
      socket.emit("register_user", { user_id: userData.id });
    }

    // cleanup on unmount
    return () => {
      socket.off("new_pending_order");
      socket.off("order_confirmed");
      socket.off("order_cancelled");
    };
  }, [userData]);

  // Function to view pending orders (you'll create this modal next)
  const viewPendingOrders = () => {
    // This will open a modal with pending orders list
    setShowNotifications(true);
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-amber-50">
        {/* Loading animation... */}
      </div>
    );
  }

  return (
    <div className="bg-gray-50 flex flex-col lg:flex-row ">
      <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="w-full h-screen text-gray-800 pt-20 lg:pt-6">
        {/* Header with Notification Bell */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8 ml-0 lg:ml-65">
          <div className="bg-amber-100 hidden lg:block p-2 sm:p-3 rounded-lg mr-0 sm:mr-4 mb-3 sm:mb-0">
            <FontAwesomeIcon icon={faListCheck} className="text-amber-600 text-lg lg:text-2xl" />
          </div>
          <div className="flex-1">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Order Management
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Create and manage customer orders
            </p>
          </div>
          
          {/* Notification Bell */}
          {(userData?.role === 'Admin' || userData?.role === 'System Administrator') && (
            <div className="relative">
              <button 
                onClick={viewPendingOrders}
                className="p-3 bg-amber-100 rounded-lg hover:bg-amber-200 transition-colors"
              >
                <FontAwesomeIcon icon={faBell} className="text-amber-600 text-lg" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            </div>
          )}
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6 pb-6 lg:pb-8 ml-0 lg:ml-65 bg-gray-50">
          <CreateOrder
            categories={categories}
            setItemsAdded={setItemsAdded}
            itemsAdded={itemsAdded}
          />
          <OrderSummary 
            itemsAdded={itemsAdded} 
            setItemsAdded={setItemsAdded}
          />
        </div>

        {/* Pending Orders Modal (you'll create this next) */}
        {showNotifications && (
          <PendingOrdersModal
            onClose={() => setShowNotifications(false)}
            notifications={notifications}
          />
        )}
      </div>
    </div>
  );
}