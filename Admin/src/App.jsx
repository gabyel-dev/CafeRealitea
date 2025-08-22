import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import Register from "./routes/Dashboard/Admin/pages/CreateAccount";
import AdminDashboard from "./routes/Dashboard/Admin/pages/Admin";
import OrderManagementAdmin from "./routes/Dashboard/Admin/pages/OrderManagement";
import SalesHistory from "./routes/Dashboard/Admin/pages/SalesHistory";

import StaffDashboard from "./routes/Dashboard/Staff/pages/Staff";
import { useState } from "react";
import NotFound from "./routes/NotFound";


const App = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <Router>
      <Routes>
        <Route 
          path="/" 
          element={<Login />} 
        />

        <Route 
          path="/Admin/CreateAccount" 
          element={<Register activeTab={activeTab} setActiveTab={setActiveTab} />} 
        />

      <Route 
          path="/Staff/dashboard" 
          element={<StaffDashboard activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

    {/* Admin Routes */}
      <Route 
          path="/Admin/dashboard" 
          element={<AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/Admin/sales" 
          element={<SalesHistory activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/Admin/orders" 
          element={<OrderManagementAdmin activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />
      
      <Route 
          path="/Admin/UsersManagement" 
          element={<AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/Admin/settings" 
          element={<AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  )
}

export default App;
