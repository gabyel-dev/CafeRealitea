export default function OrderSummary() {
    return (
        <div className="w-[60%] bg-white shadow-md rounded-lg h-fit">
            <header className="w-full border-b-1 border-gray-200 p-6 h-18 flex items-center">
                <h1 className="text-gray-800 font-semibold">
                    Order Summary
                </h1>
            </header>

            <div className="p-6 h-fit text-gray-800">
                <p className="font-semibold text-sm">Payment Method</p>
                <select name="" id="">
                    <option value="">Cash</option>
                    <option value="">G-Cash</option>
                </select>

                 <p className="pt-6 font-semibold">Order Items</p>
                
            </div>
        </div>
    )
}