import { useState, useEffect } from "react";
import axios from "axios";

export default function CreateOrder() {
    const [categories, setCategories] = useState([])

    useEffect(() => {
        axios.get('http://localhost:5000/items').then((res) => setCategories(res.data)).catch((err) => console.error(err));
        
    }, [])
    return (
        <div className="w-full bg-white shadow-md rounded-lg">
            <header className="w-full border-b-1 border-gray-200 p-6 h-18 flex items-center">
                <h1 className="text-gray-800 font-semibold">
                    Create New Order
                </h1>
            </header>

            <div className="p-6 h-fit text-gray-800">
                <p className="font-semibold text-sm">Customer Name</p>
                <input type="text"
                    placeholder="Walk-In Customer"
                 className="w-full border-b-1 border-gray-100" />

                 <p className="pt-6 font-semibold text-sm">Order Type</p>
                 <div className="grid grid-cols-2 gap-3 pt-2">
                    <div className="flex gap-2  text-gray-800">
                    <input type="radio" className="w-4" />
                    <p>Takeout</p>
                 </div>

                 <div className="flex gap-2  text-gray-800">
                    <input type="radio" className="w-4" />
                    <p>Delivery</p>
                 </div>
                 </div>

                  <p className="pt-6 font-semibold text-sm">Add Items</p>
                 

                 <div>
  {categories.map((cat) => (
    <div key={cat.category_id} className="pt-4">
      <h1 className="font-semibold text-lg">{cat.category_name}</h1>

      <div className="grid grid-cols-2 gap-3 pt-2">
        {cat.items.map((item) => (
          <div 
            key={item.id} 
            className="flex justify-between items-center border p-3 rounded-lg shadow-sm"
          >
            <span className="text-gray-800">{item.name}</span>
            <span className="text-orange-600 font-semibold">
              ₱{item.price}
            </span>
          </div>
        ))}
      </div>
    </div>
  ))}
</div>

            </div>
        </div>
    )
}