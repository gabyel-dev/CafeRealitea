import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import AdminDashboard from "./routes/Dashboard/Admin/pages/Admin"
import StaffDashboard from "./routes/Dashboard/Staff/pages/Staff"

const App = () => {
  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={<Login />} 
        />

      <Route 
          path="/dashboard/Staff" 
          element={<StaffDashboard />} 
      />

      <Route 
          path="/dashboard/Admin" 
          element={<AdminDashboard />} 
      />
      </Routes>
    </Router>
  )
}

export default App
