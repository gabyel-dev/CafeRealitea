import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function CreateOrder({ categories, setItemsAdded, itemsAdded }) {
    const [toast, setToast] = useState(null);

    const addItem = (item) => {
        setItemsAdded((prev) => [...prev, item]);
        setToast(`${item.name} added!`);

        // Remove toast after 2.5s
        setTimeout(() => {
            setToast(null);
        }, 2500);
    };

    return (
        <div className="w-full h-fit bg-white shadow-md rounded-lg relative">
            <header className="w-full border-b-1 border-gray-200 p-6 flex items-center">
                <h1 className="text-gray-800 font-semibold text-base md:text-lg lg:text-xl">
                    Create New Order
                </h1>
            </header>

            <div className="p-6 text-gray-800 text-sm md:text-base lg:text-base">
                <p className="font-semibold text-sm md:text-base">Add Items</p>
                <div>
                    {categories.map((cat) => (
                        <div key={cat.category_id} className="pt-4">
                            <h1 className="font-semibold text-base md:text-lg">
                                {cat.category_name}
                            </h1>
                            <div className="grid grid-cols-2 gap-3 pt-2">
                                {cat.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="group flex justify-between items-center border border-gray-300 p-2 md:p-3 rounded-lg shadow-sm cursor-pointer hover:bg-amber-600 hover:text-white transition-all duration-100 text-sm md:text-base"
                                        onClick={() => addItem(item)}
                                    >
                                        <span>{item.name}</span>
                                        <div className="text-amber-500 group-hover:text-white ">
                                            <span className="font-semibold">₱{item.price}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Toast Notification */}
            <AnimatePresence>
                {toast && (
                    <motion.div
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: 50 }}
                        transition={{ duration: 0.5 }}
                        className="fixed bottom-5 block md:hidden right-5 z-1000 bg-amber-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm md:text-base"
                    >
                        {toast}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
