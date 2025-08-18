import { useState } from "react";

export default function OrderSummary({ itemsAdded, setItemsAdded }) {  // Added setItemsAdded prop
    const [customerMoney, setCustomerMoney] = useState(0);
    const [paymentMethod, setPaymentMethod] = useState("Cash");
    const [customerName, setCustomerName] = useState("Walk-in customer");
    const [orderType, setOrderType] = useState("Dine-in");
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const total = itemsAdded.reduce((sum, item) => sum + item.price, 0);
    const change = customerMoney - total;

    const handleCompleteOrder = async () => {
    const orderData = {
        customer_name: customerName,
        order_type: orderType,
        payment_method: paymentMethod,
        total: total,
        items: itemsAdded.map(item => ({
            id: item.id,
            quantity: item.quantity,
            price: item.price
        }))
    };

    try {
        const response = await fetch('http://localhost:5000/orders', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(orderData)
        })
        
        if (!response.ok) throw new Error('Failed to save order');
        
        const data = await response.json();
        alert(`Order #${data.order_id} - ${data.message}`)
        
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
};



    return (
        <div className="w-[60%] bg-white shadow-md rounded-lg h-fit sticky top-0">
            <header className="w-full border-b-1 border-gray-200 p-6 flex items-center">
                <h1 className="text-gray-800 font-semibold">Order Summary</h1>
            </header>

            <div className="p-6 text-gray-800">
                <div className="flex flex-col gap-4 mb-4">
                    <div>
                        <label className="font-semibold text-sm">Customer Name</label>
                        <input 
                            type="text" 
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            className="w-full border-b border-gray-200 p-2"
                        />
                    </div>
                    
                    <div>
                        <label className="font-semibold text-sm">Order Type</label>
                        
                        <select 
                            value={orderType}
                            onChange={(e) => setOrderType(e.target.value)}
                            className="w-full border-b border-gray-200 p-2"
                        >
                            <option value="Dine-in">Dine-in</option>
                            <option value="Delivery">Delivery</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="font-semibold text-sm">Payment Method</label>
                        <select 
                            value={paymentMethod}
                            onChange={(e) => setPaymentMethod(e.target.value)}
                            className="w-full border-b border-gray-200 p-2"
                        >
                            <option value="Cash">Cash</option>
                            <option value="GCash">G-Cash</option>
                        </select>
                    </div>
                    
                    <div>
                        <label className="font-semibold text-sm">Customer Money</label>
                        <div className="flex gap-2 items-center justify-center">
                            <p className="text-xl pl-3 pr-3 border-r-1 border-gray-200">
                            ₱
                        </p>
                        <input 
                            type="text" 
                            value={customerMoney}
                            onChange={(e) => setCustomerMoney(e.target.value)}
                            className="w-full p-2 text-amber-500"
                        />
                        </div>
                    </div>
                </div>

                <p className="pt-6 font-semibold text-sm">Order Items</p>
                <div className="pt-2">
                    {itemsAdded.length === 0 && <p className="text-gray-500 text-sm italic">No items added yet.</p>}
                    {itemsAdded.map((item, i) => (
                        <div key={i} className="flex justify-between py-2">
                            <span>{item.name}</span>
                            <span>₱{item.price}</span>
                        </div>
                    ))}
                </div>

                <div className="flex flex-col gap-1">
                    <div className="pt-4 border-t mt-4 flex justify-between font-semibold text-lg">
                        <span>Total</span>
                        <span>₱{total}</span>
                    </div>
                    <div className="flex justify-between text-lg">
                        <p className="text-sm">Change</p>
                        <p className="text-md">₱{change}</p>
                    </div>
                </div>

                <div className="w-full flex justify-center items-center pt-4">
                    <button 
                        onClick={handleCompleteOrder}
                        disabled={isSubmitting || itemsAdded.length === 0}
                        className={`bg-amber-600 w-full py-3 rounded-md text-white  ${
                        isSubmitting  || customerMoney <= 0 || customerMoney < total ? 'opacity-50 cursor-not-allowed' : 'hover:bg-amber-700 transition-all cursor-pointer'
                        }`}
                    >
                        {isSubmitting ? "Processing..." : "Complete Order"}
                    </button>
                </div>
            </div>
        </div>
    );
}