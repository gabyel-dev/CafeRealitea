import { HashRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import Register from "./routes/Dashboard/Admin/pages/CreateAccount";
import AdminDashboard from "./routes/Dashboard/Admin/pages/Admin";
import OrderManagementAdmin from "./routes/Dashboard/Admin/pages/OrderManagement";
import SalesHistory from "./routes/Dashboard/Admin/pages/SalesHistory";

import { useState } from "react";
import NotFound from "./routes/NotFound";
import UsersManagement from "./routes/Dashboard/Admin/pages/UsersManagement";
import UserDetails from "./routes/Dashboard/Admin/pages/UserDetails";
import OrderDetails from "./routes/Dashboard/Admin/pages/OrderDetails";


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
          path="/CreateAccount" 
          element={<Register activeTab={activeTab} setActiveTab={setActiveTab} />} 
        />

    {/* Admin Routes */}
      <Route 
          path="/dashboard" 
          element={<AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/sales" 
          element={<SalesHistory activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/orders" 
          element={<OrderManagementAdmin activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/UserManagement" 
          element={<UsersManagement activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/UserManagement/user/" 
          element={<UserDetails activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/sales/order/" 
          element={<OrderDetails activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/settings" 
          element={<AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />


      {/* Catch-all route for 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  )
}

export default App;
