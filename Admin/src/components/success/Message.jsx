import { faCircleCheck } from "@fortawesome/free-regular-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function AccountCreation({ Message }) {
    return (
        <div className="w-full h-screen flex items-center justify-center fixed bg-black/25 z-50 backdrop-blur-sm">
            <div className="w-[400px] p-8 rounded-2xl shadow-lg bg-white text-center space-y-4">
                
                {/* Success Icon */}
                <FontAwesomeIcon 
                    icon={faCircleCheck} 
                    className="text-amber-500 text-6xl mb-4" 
                />

                {/* Title */}
                <h1 className="text-2xl font-bold text-gray-800">
                    Congratulations!
                </h1>

                {/* Message */}
                <p className="text-gray-600">
                    { Message }
                </p>

                {/* Redirect Button */}
                <Link 
                    to={"/dashboard"} 
                    className="inline-block w-full py-3 mt-4 text-white font-medium bg-amber-500 rounded-xl shadow-md hover:bg-amber-600 transition"
                >
                    Go to Dashboard
                </Link>
            </div>
        </div>
    )
}
