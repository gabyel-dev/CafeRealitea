import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Login from "./routes/Login";
import Admin from "./routes/Dashboard/Admin"
import Staff from "./routes/Dashboard/Staff"

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
          element={<Staff />} 
      />

      <Route 
          path="/dashboard/Admin" 
          element={<Admin />} 
      />
      </Routes>
    </Router>
  )
}

export default App
