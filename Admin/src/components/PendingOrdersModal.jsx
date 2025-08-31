import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCheck, faXmark } from "@fortawesome/free-solid-svg-icons";

export default function PendingOrdersModal({ onClose, notifications }) {
  const [pendingOrders, setPendingOrders] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState(null);

  useEffect(() => {
    fetchPendingOrders();
  }, []);

  const fetchPendingOrders = async () => {
    try {
      const response = await fetch('https://caferealitea.onrender.com/pending-orders', {
        credentials: 'include'
      });
      const data = await response.json();
      setPendingOrders(data);
    } catch (error) {
      console.error('Error fetching pending orders:', error);
    }
  };

  const viewOrderDetails = async (orderId) => {
    try {
      const response = await fetch(`https://caferealitea.onrender.com/pending-orders/${orderId}`, {
        credentials: 'include'
      });
      const data = await response.json();
      setSelectedOrder(data);
    } catch (error) {
      console.error('Error fetching order details:', error);
    }
  };

  const confirmOrder = async (orderId) => {
    try {
      const response = await fetch(`https://caferealitea.onrender.com/pending-orders/${orderId}/confirm`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Order confirmed successfully!');
        setSelectedOrder(null);
        fetchPendingOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error confirming order:', error);
    }
  };

  const cancelOrder = async (orderId) => {
    try {
      const response = await fetch(`https://caferealitea.onrender.com/pending-orders/${orderId}/cancel`, {
        method: 'POST',
        credentials: 'include'
      });
      
      if (response.ok) {
        alert('Order cancelled successfully!');
        setSelectedOrder(null);
        fetchPendingOrders(); // Refresh the list
      }
    } catch (error) {
      console.error('Error cancelling order:', error);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-11/12 max-w-4xl max-h-90vh overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Pending Orders</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <FontAwesomeIcon icon={faTimes} size="lg" />
          </button>
        </div>

        {selectedOrder ? (
          // Order Details View
          <div>
            <h3 className="text-lg font-semibold mb-4">Order #{selectedOrder.id}</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <p><strong>Customer:</strong> {selectedOrder.customer_name}</p>
                <p><strong>Type:</strong> {selectedOrder.order_type}</p>
              </div>
              <div>
                <p><strong>Payment:</strong> {selectedOrder.payment_method}</p>
                <p><strong>Total:</strong> ₱{selectedOrder.total}</p>
              </div>
            </div>

            <h4 className="font-semibold mb-2">Items:</h4>
            <div className="mb-4">
              {selectedOrder.items?.map((item, index) => (
                <div key={index} className="flex justify-between py-1">
                  <span>{item.name} (x{item.quantity})</span>
                  <span>₱{item.price * item.quantity}</span>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <button 
                onClick={() => confirmOrder(selectedOrder.id)}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                <FontAwesomeIcon icon={faCheck} className="mr-2" />
                Confirm Order
              </button>
              <button 
                onClick={() => cancelOrder(selectedOrder.id)}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
              >
                <FontAwesomeIcon icon={faXmark} className="mr-2" />
                Cancel Order
              </button>
              <button 
                onClick={() => setSelectedOrder(null)}
                className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
              >
                Back to List
              </button>
            </div>
          </div>
        ) : (
          // Orders List View
          <div>
            {pendingOrders.length === 0 ? (
              <p className="text-gray-500">No pending orders</p>
            ) : (
              <div className="space-y-3">
                {pendingOrders.map((order) => (
                  <div key={order.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                    <div onClick={() => viewOrderDetails(order.id)}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-semibold">Order #{order.id}</h4>
                          <p className="text-sm text-gray-600">{order.customer_name}</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold">₱{order.total}</p>
                          <p className="text-sm text-gray-500">{order.order_type}</p>
                        </div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(order.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}