import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate();
    const [userData, setUserData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [categories, setCategories] = useState([])

    useEffect(() => {
        axios.get('http://localhost:5000/items')
        .then((res) => setCategories(res.data))
    }, [])

    const handleLogout = () => {
        axios.post('http://localhost:5000/logout', {}, { withCredentials: true })
            .then(() => navigate('/login'))
            .catch(err => {
                console.error("Logout failed:", err);
                // Still navigate to login even if logout request fails
                navigate('/login');
            });
    };

    useEffect(() => {
        document.title = "Café Realitea - Admin";
        setLoading(true);
        
        axios.get('http://localhost:5000/user', { withCredentials: true })
            .then((res) => {
                if (!res.data.logged_in || res.data.role === "") {
                    navigate('/login');
                    return;
                }

                if (res.data.role !== 'Admin') {
                    navigate(`/dashboard/${res.data.role}`);
                    return;
                }

                setUserData(res.data);
            })
            .catch((err) => {
                console.error("Authentication check failed:", err);
                navigate('/login');
            })
            .finally(() => {
                setLoading(false);
            });
    }, [navigate]);

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-gray-900">
                        Café Realitea - Admin Dashboard
                    </h1>
                    <button
                        onClick={handleLogout}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-amber-600 hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-amber-500"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                <div className="px-4 py-6 sm:px-0">
                    <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center">
                        <h2 className="text-2xl font-semibold text-gray-800 mb-4">
                            Welcome, {userData?.user?.name || 'Admin Member'}!
                        </h2>
                        <p className="text-gray-600">
                            You have successfully logged in as a Admin member.
                        </p>
                    </div>
                </div>
            </main>

            {categories.map((cat) => (
                <div key={cat.category_id}>
                    <p>{cat.category_name}</p>
                    {cat.items.map((item) => (
                        <p key={item.id}>{item.name}</p>
                    ))}

                    {cat.items.map((item) => (
                        <p key={item.id}>{item.price}</p>
                    ))}
                </div>
            ))}

        </div>
    );
}