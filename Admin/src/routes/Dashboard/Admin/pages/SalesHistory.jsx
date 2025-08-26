import AdminSidePanel from "../../../../components/AdminSidePanel";
import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { Link } from "react-router-dom";

export default function SalesHistory({ activeTab, setActiveTab }) {
    const navigate = useNavigate();
    const [dailySalesData, setDailySalesData] = useState([]);
    const [filteredData, setFilteredData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [paymentFilter, setPaymentFilter] = useState('all');
    const [availableYears, setAvailableYears] = useState([]);
    const [availableMonths, setAvailableMonths] = useState([]);
    const [orderTypeFilter, setOrderTypeFilter] = useState('all');
    const [filters, setFilters] = useState({
        year: 'all',
        month: 'all',
        
    });

    useEffect(() => {
        // Fetch sales data
        axios.get('https://caferealitea.onrender.com/daily-sales')
            .then((res) => {
                setDailySalesData(res.data);
                setFilteredData(res.data);
                setLoading(false);
            })
            .catch(error => {
                console.error("Error fetching sales data:", error);
                setLoading(false);
            });

        // Fetch available years
        axios.get('https://caferealitea.onrender.com/orders/year')
            .then((res) => {
                const years = res.data.map(item => item.year);
                setAvailableYears(years);
            })
            .catch(error => {
                console.error("Error fetching years:", error);
            });

        // Fetch available months
        axios.get('https://caferealitea.onrender.com/orders/months')
            .then((res) => {
                setAvailableMonths(res.data);
            })
            .catch(error => {
                console.error("Error fetching months:", error);
            });
    }, []);

    useEffect(() => {
  axios.get('https://caferealitea.onrender.com/user', { withCredentials: true })
    .then((res) => {
      const { logged_in, role } = res.data;

      // Allow Admin and Super Admin roles
      if (!logged_in ) {
        navigate('/');
      }

    })
    .catch(() => navigate('/'));
}, []);


    // Apply all filters
    const applyFilters = () => {
        let result = dailySalesData;
        
        // Apply payment method filter
        if (paymentFilter !== 'all') {
            result = result.filter(item => item.payment_method === paymentFilter);
        }

        if (orderTypeFilter !== 'all' ) {
            result = result.filter(item => item.order_type === orderTypeFilter)
        }
        
        // Note: For year/month/day filtering, you would need to implement additional logic
        // since your current backend endpoint doesn't support filtering by these parameters
        // You would either need to:
        // 1. Create a new backend endpoint that accepts year/month/day parameters
        // 2. Or implement the filtering on the frontend if you have the raw date data
        
        setFilteredData(result);
    };

    // Handle filter changes
    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Reset all filters
    const resetFilters = () => {
        setPaymentFilter('all');
        setOrderTypeFilter('all');
        setFilters({
            year: 'all',
            month: 'all',
            day: 'all'
        });
        setFilteredData(dailySalesData);
    };

    // Get month name from number
    const getMonthName = (monthNumber) => {
        const months = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        return months[monthNumber - 1] || '';
    };

    return (
        <>
            <AdminSidePanel activeTab={activeTab} setActiveTab={setActiveTab} />
            <div className="ml-65 py-6 px-8 bg-gray-50 min-h-screen">
                <div className="w-full mb-6">
                    <h1 className="text-3xl font-bold">Sales History</h1>
                    <p className="text-gray-600">View and manage all sales records</p>
                </div>

                {/* Filters Section */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <h2 className="text-xl font-semibold mb-4">Filters</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                        {/* Year Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                            <select
                                name="year"
                                value={filters.year}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="all">All Years</option>
                                {availableYears.map(year => (
                                    <option key={year} value={year}>{year}</option>
                                ))}
                            </select>
                        </div>
                        
                        {/* Month Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Month</label>
                            <select
                                name="month"
                                value={filters.month}
                                onChange={handleFilterChange}
                                className="w-full p-2 border border-gray-300 rounded-md"
                                disabled={filters.year === 'all'}
                            >
                                <option value="all">All Months</option>
                                {availableMonths
                                    .filter(month => filters.year === 'all' || month.year == filters.year)
                                    .map(month => (
                                        <option key={`${month.year}-${month.months}`} value={month.months}>
                                            {getMonthName(month.months)}
                                        </option>
                                    ))
                                }
                            </select>
                        </div>
                        
                        {/* Day Filter - This would need additional backend support */}
                        {/* Order Type Filter */}
                        <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Order Type</label>
                        <select
                            name="orderType"
                            value={orderTypeFilter}
                            onChange={(e) => setOrderTypeFilter(e.target.value)}
                            className="w-full p-2 border border-gray-300 rounded-md"
                        >
                            <option value="all">All Orders</option>
                            <option value="Dine-in">Dine-in</option>
                            <option value="Delivery">Delivery</option>
                        </select>
                        </div>

                        
                        {/* Payment Method Filter */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Payment Method</label>
                            <select
                                name="paymentMethod"
                                value={paymentFilter}
                                onChange={(e) => setPaymentFilter(e.target.value)}
                                className="w-full p-2 border border-gray-300 rounded-md"
                            >
                                <option value="all">All Methods</option>
                                <option value="Cash">Cash</option>
                                <option value="GCash">GCash</option>
                            </select>
                        </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={resetFilters}
                            className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                        >
                            Reset All
                        </button>
                        <button
                            onClick={applyFilters}
                            className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 transition-colors"
                        >
                            Apply Filters
                        </button>
                    </div>
                </div>

                {/* Results Count */}
                <div className="mb-4 flex justify-between items-center">
                    <p className="text-gray-600">
                        Showing {filteredData.length} of {dailySalesData.length} records
                    </p>
                </div>

                {/* Sales List */}
                {loading ? (
                    <div className="flex justify-center items-center h-64">
                        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-500"></div>
                    </div>
                ) : filteredData.length === 0 ? (
                    <div className="bg-white rounded-lg shadow-sm p-8 text-center">
                        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m0 0V9m0 8h6m-6 0H7m12 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <h3 className="mt-2 text-lg font-medium text-gray-900">No sales records found</h3>
                        <p className="mt-1 text-gray-500">Try adjusting your filters.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                        <div className="divide-y divide-gray-200">
                            {filteredData.map((sale) => (
                                <div key={sale.id} className="p-6 hover:bg-amber-50 transition-all duration-200">
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <div className="text-lg font-medium text-gray-900">
                                                {sale.order_time}
                                            </div>
                                            <div className="mt-1 text-sm text-gray-500">
                                                Order ID: #{sale.id} • {sale.order_type}
                                            </div>
                                        </div>

                                        <Link
                                        to={`order/${sale.id}`}
                                        className={`flex items-center space-x-2 px-4 py-2 rounded-lg font-medium transition-colors bg-amber-600 hover:bg-amber-700 text-white
                                        `}
                                        >
                                        <span>View Details</span>
                                        <FontAwesomeIcon icon={faArrowRight} />
                                        </Link>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </>
    );
}