// src/pages/NotFound.jsx
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-gray-50 to-gray-100 text-center p-6">
      <h1 className="text-9xl font-extrabold text-gray-300 select-none">404</h1>
      <h2 className="mt-4 text-3xl font-bold text-gray-800">
        Oops! Page not found
      </h2>
      <p className="mt-2 text-gray-600 max-w-md">
        The page you are looking for doesn’t exist or has been moved.  
        But don’t worry, let’s get you back to the coffee!
      </p>

      <Link
        to="/login"
        className="mt-6 inline-block px-6 py-3 bg-gray-700 hover:bg-gray-900 text-white font-medium rounded-lg shadow-md transition-all duration-200"
      >
        Go Back Home
      </Link>
    </div>
  );
}
