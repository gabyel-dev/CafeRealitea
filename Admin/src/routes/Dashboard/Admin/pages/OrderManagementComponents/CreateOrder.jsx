export default function CreateOrder({ categories, setItemsAdded, itemsAdded }) {
    const addItem = (item) => {
        setItemsAdded((prev) => [...prev, item]);
    };

    return (
        <div className="w-full h-fit bg-white shadow-md rounded-lg">
            <header className="w-full border-b-1 border-gray-200 p-6 flex items-center">
                <h1 className="text-gray-800 font-semibold">Create New Order</h1>
            </header>

            <div className="p-6 text-gray-800">
                <p className=" font-semibold text-sm">Add Items</p>
                <div>
                    {categories.map((cat) => (
                        <div key={cat.category_id} className="pt-4">
                            <h1 className="font-semibold text-lg">{cat.category_name}</h1>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {cat.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="flex justify-between items-center border border-gray-300 p-3 rounded-lg shadow-sm cursor-pointer hover:bg-gray-100"
                                        onClick={() => addItem(item)}
                                    >
                                        <span>{item.name}</span>
                                        <span className="text-orange-600 font-semibold">₱{item.price}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
