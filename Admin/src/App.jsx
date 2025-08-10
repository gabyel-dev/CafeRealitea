import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import AdminDashboard from "./routes/Dashboard/Admin/pages/Admin"
import StaffDashboard from "./routes/Dashboard/Staff/pages/Staff"
import { useState } from "react";

const App = () => {
  const [activeTab, setActiveTab] = useState("Dashboard");

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login />} 
        />

      <Route 
          path="/dashboard/Staff" 
          element={<StaffDashboard activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />

      <Route 
          path="/dashboard/Admin" 
          element={<AdminDashboard activeTab={activeTab} setActiveTab={setActiveTab} />} 
      />
      </Routes>
    </Router>
  )
}

export default App
