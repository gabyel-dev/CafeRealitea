import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import AdminSidePanel from "../../../../components/AdminSidePanel";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import CreateOrder from "./OrderManagementComponents/CreateOrder";
import OrderSummary from "./OrderManagementComponents/OrderSummary";
import { faListCheck } from "@fortawesome/free-solid-svg-icons";
import { io } from "socket.io-client";

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

  // 🔥 Socket.io notifications
  useEffect(() => {
    socket.on("notification", (data) => {
      console.log("📢 New Notification:", data);

      if (data.type === "personal") {
        // For the logged-in user (like cashier, staff)
        alert(data.message);
      } else if (data.type === "broadcast") {
        // For admins/staff watching pending orders
        alert(data.message);
        // Later: can trigger a refresh of pending orders list
      }
    });

    // cleanup on unmount
    return () => {
      socket.off("notification");
    };
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center h-screen bg-amber-50">
        {/* Coffee Icon */}
        <div className="relative">
          <div className="w-16 h-12 border-4 border-amber-900 rounded-b-xl rounded-t-sm overflow-hidden">
            <div
              className="absolute bottom-0 left-0 w-full bg-amber-700 transition-all duration-2000"
              style={{
                height: "0%",
                animation: "coffeeFill 1.5s ease-in-out forwards",
                animationDelay: "0.3s",
              }}
            ></div>
          </div>
          <div className="absolute -top-0.5 -inset-x-0.5 h-1 bg-amber-900 rounded-t-sm"></div>
          <div className="absolute -bottom-2 -inset-x-4 h-2 bg-amber-200 rounded-full"></div>
        </div>

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

  return (
    <div className="bg-gray-50 flex flex-col lg:flex-row ">
      <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />

      <div className="w-full h-screen text-gray-800 pt-20 lg:pt-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center mb-6 sm:mb-8 px-4 sm:px-6 lg:px-8 ml-0 lg:ml-65">
          <div className="bg-amber-100 hidden lg:block p-2 sm:p-3 rounded-lg mr-0 sm:mr-4 mb-3 sm:mb-0">
            <FontAwesomeIcon icon={faListCheck} className="text-amber-600 text-lg lg:text-2xl" />
          </div>
          <div>
            {/* text size scales up */}
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-800">
              Order Management
            </h1>
            <p className="text-gray-500 text-sm sm:text-base">
              Create and manage customer orders
            </p>
          </div>
        </div>

        {/* Main content */}
        <div className="flex flex-col lg:flex-row px-4 sm:px-6 lg:px-8 gap-4 sm:gap-6 pb-6 lg:pb-8 ml-0 lg:ml-65 bg-gray-50">
          <CreateOrder
            categories={categories}
            setItemsAdded={setItemsAdded}
            itemsAdded={itemsAdded}
          />
          <OrderSummary itemsAdded={itemsAdded} />
        </div>
      </div>
    </div>
  );
}
